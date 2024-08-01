import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import CommonLoader from './elements/commonLoader';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import { UPDATED_PRODUCT_PAGINATION, PRODUCT_PREV_PAGINATION, REARANGE_ORDER, MERCHANDISING_PAGINATION, PARENT_CATEGORY_LIST } from '@/query/product';

const Index = () => {
    const PAGE_SIZE = 20;
    const router = useRouter();

    const [reorder] = useMutation(REARANGE_ORDER);

    const { data: parentList } = useQuery(PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });

    const [recordsData, setRecordsData] = useState([]);
    const [startCursor, setStartCursor] = useState(null);
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [status, setStatus] = useState('');
    const [dropIndex, setDropIndex] = useState(null);
    const [parentLists, setParentLists] = useState([]);

    const buildFilter = (category, availability) => {
        const filter: any = {};
        if (router?.query?.category) {
            filter.categories = [router?.query?.category];
        } else if (category && category !== '') {
            filter.categories = [category];
        }
        if (availability) {
            filter.stockAvailability = availability;
        }
        return filter;
    };

    const getParentCategories = () => {
        const parentCategories = parentList?.categories?.edges || [];
        return parentCategories.map(({ node }) => ({
            id: node.id,
            name: node.name,
            children:
                node.children?.edges.map(({ node }) => ({
                    id: node.id,
                    name: node.name,
                })) || [],
        }));
    };

    useEffect(() => {
        if (parentList) {
            setParentLists(getParentCategories());
        }
    }, [parentList]);

    const { loading: getLoading, refetch: fetchLowStockList } = useQuery(MERCHANDISING_PAGINATION, {
        variables: {
            channel: 'india-channel',
            first: PAGE_SIZE,
            after: null,
            search: search,
            sortBy: { direction: 'ASC', field: 'ORDER_NO' },
            filter: buildFilter(selectedCategory, status),
        },
        onCompleted: (data) => {
            const products = data?.products?.edges || [];
            setRecordsData(tableFormat(products));
            setStartCursor(data?.products?.pageInfo?.startCursor || null);
            setEndCursor(data?.products?.pageInfo?.endCursor || null);
            setHasNextPage(data?.products?.pageInfo?.hasNextPage || false);
            setHasPreviousPage(data?.products?.pageInfo?.hasPreviousPage || false);
        },
    });

    const [fetchNextPage] = useLazyQuery(UPDATED_PRODUCT_PAGINATION, {
        onCompleted: (data) => {
            const products = data?.products?.edges || [];
            setRecordsData(tableFormat(products));
            setStartCursor(data?.products?.pageInfo?.startCursor || null);
            setEndCursor(data?.products?.pageInfo?.endCursor || null);
            setHasNextPage(data?.products?.pageInfo?.hasNextPage || false);
            setHasPreviousPage(data?.products?.pageInfo?.hasPreviousPage || false);
        },
    });

    const [fetchPreviousPage] = useLazyQuery(PRODUCT_PREV_PAGINATION, {
        onCompleted: (data) => {
            const products = data?.products?.edges || [];
            setRecordsData(tableFormat(products));
            setStartCursor(data?.products?.pageInfo?.startCursor || null);
            setEndCursor(data?.products?.pageInfo?.endCursor || null);
            setHasNextPage(data?.products?.pageInfo?.hasNextPage || false);
            setHasPreviousPage(data?.products?.pageInfo?.hasPreviousPage || false);
        },
    });

    const handleNextPage = () => {
        fetchNextPage({
            variables: {
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: endCursor,
                search: search,
                sortBy: { direction: 'ASC', field: 'ORDER_NO' },
                filter: buildFilter(selectedCategory, status),
            },
        });
    };

    const handlePreviousPage = () => {
        fetchPreviousPage({
            variables: {
                channel: 'india-channel',
                last: PAGE_SIZE,
                before: startCursor,
                search: search,
                sortBy: { direction: 'ASC', field: 'ORDER_NO' },
                filter: buildFilter(selectedCategory, status),
            },
        });
    };

    const handleSearchChange = (e) => {
        setSearch(e);
        fetchLowStockList({
            variables: {
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: null,
                search: e,
                sortBy: { direction: 'ASC', field: 'ORDER_NO' },
                filter: buildFilter(selectedCategory, status),
            },
        });
    };

    const handleDragStart = (e, id, index) => {
        e.dataTransfer.setData('id', id);
        setDropIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, targetIndex) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('id');
        const draggedIndex = dropIndex;

        if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
            const newRecordsData = [...recordsData];
            const [draggedItem] = newRecordsData.splice(draggedIndex, 1);
            newRecordsData.splice(targetIndex, 0, draggedItem);

            // Determine the range to update based on the drag and drop positions
            const startIndex = Math.min(draggedIndex, targetIndex);
            const endIndex = Math.max(draggedIndex, targetIndex) + 1;

            // Extract the updated portion of the array
            const updatedRange = newRecordsData.slice(startIndex, endIndex);

            console.log('Updated Range:', updatedRange);
            const formattedUpdatedRange = updatedRange.map((item, index) => ({
                productId: item.id,
                orderNo: startIndex + index + 1, // Adjust order number based on startIndex
            }));
            console.log('formattedUpdatedRange: ', formattedUpdatedRange);
            const res = await reorder({
                variables: {
                    input: {
                        updates: formattedUpdatedRange,
                    },
                },
            });
            console.log('res: ', res);

            // Set the updated data and recalculate order numbers
            setRecordsData(newRecordsData);

            // Log the dragged and dropped products
            console.log('Dragged Product:', draggedItem);
            console.log('Dropped Product:', recordsData[targetIndex]);
        }
    };

    const tableFormat = (products) => {
        console.log('products: ', products);
        const newData = products?.map((item) => ({
            ...item.node,
            image: productImg(item?.node),
            name: item.node.name,
            id: item.node.id,
            orderNo: item.node.orderNo,
        }));
        return newData;
    };

    const productImg = (item) => {
        let img = '';
        const imgFormats = ['.jpeg', '.png', '.jpg', '.webp'];
        const endsWithAny = (url, formats) => formats.some((format) => url?.endsWith(format));
        if (endsWithAny(item?.thumbnail?.url, imgFormats)) {
            img = item?.thumbnail?.url || '';
        }
        return img;
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        fetchLowStockList({
            variables: {
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: null,
                search: search,
                filter: buildFilter(e.target.value, status),
            },
        });
    };

    return (
        <div>
            <div className="panel  mb-5 flex items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                    <h5 className="text-lg font-semibold dark:text-white-light">Merchandising</h5>
                </div>
                <div>
                    <button type="button" className="btn btn-primary w-full md:mb-0 md:w-auto" onClick={() => router.push('/apps/product/add')}>
                        + Create
                    </button>
                </div>
            </div>
            <div className="mb-5 mt-5 flex justify-between md:mb-0 md:mt-0 md:flex md:ltr:ml-auto md:rtl:mr-auto">
                <div>
                    <input type="text" className=" form-input mb-3 mr-2 h-[40px] md:mb-0 md:w-auto " placeholder="Search..." value={search} onChange={(e) => handleSearchChange(e.target.value)} />
                </div>
                <div>
                    <select className="form-select flex-1" value={selectedCategory} onChange={handleCategoryChange}>
                        <option value="">Select a Category</option>
                        {parentLists.map((parent) => (
                            <React.Fragment key={parent.id}>
                                <option value={parent.id}>{parent.name}</option>
                                {parent.children.map((child) => (
                                    <option key={child.id} value={child.id} style={{ paddingLeft: '20px' }}>
                                        -- {child.name}
                                    </option>
                                ))}
                            </React.Fragment>
                        ))}
                    </select>
                </div>
            </div>
            {getLoading ? (
                <CommonLoader />
            ) : (
                <div className="grid grid-cols-5 gap-5 pt-5">
                    {recordsData?.length > 0 ? (
                        recordsData.map((record, index) => (
                            <div key={record.id} className="card" draggable onDragStart={(e) => handleDragStart(e, record.id, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)}>
                                <img src={record.image} alt={record.name} className="h-48 w-full object-cover" />
                                <div className="mt-2 text-center">{record.name}</div>
                            </div>
                        ))
                    ) : (
                        <div className=' flex items-center justify-center'>No Data Found</div>
                    )}
                </div>
            )}
            <div className="mt-5 flex justify-end gap-3">
                <button disabled={!hasPreviousPage} onClick={handlePreviousPage} className={`btn ${!hasPreviousPage ? 'btn-disabled' : 'btn-primary'}`}>
                    <IconArrowBackward />
                </button>
                <button disabled={!hasNextPage} onClick={handleNextPage} className={`btn ${!hasNextPage ? 'btn-disabled' : 'btn-primary'}`}>
                    <IconArrowForward />
                </button>
            </div>
        </div>
    );
};

export default PrivateRouter(Index);
