import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import CommonLoader from './elements/commonLoader';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import placeholders from '../public/assets/images/placeholder.png';
import { UPDATED_PRODUCT_PAGINATION, PRODUCT_PREV_PAGINATION, REARANGE_ORDER, MERCHANDISING_PAGINATION, PARENT_CATEGORY_LIST } from '@/query/product';
import { Success, isValidImageUrl } from '@/utils/functions';
import IconLoader from '@/components/Icon/IconLoader';

const Index = () => {
    const PAGE_SIZE = 20;
    const router = useRouter();

    const [reorder, { loading: reorderLoading }] = useMutation(REARANGE_ORDER);

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
    const [selectPage, setSelectPage] = useState(20);

    const [status, setStatus] = useState('');
    const [dropIndex, setDropIndex] = useState(null);
    const [parentLists, setParentLists] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);

    const buildFilter = (category, availability) => {
        const filter: any = {};
        if (router?.query?.category) {
            filter.categories = [router?.query?.category];
        } else if (category && category !== '') {
            filter.categories = [category];
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
            first: selectPage,
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
                first: selectPage,
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
                last: selectPage,
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
                first: selectPage,
                after: null,
                search: e,
                sortBy: { direction: 'ASC', field: 'ORDER_NO' },
                filter: buildFilter(selectedCategory, status),
            },
        });
    };

    const handleDragStart = (e, id, index) => {
        e.dataTransfer.setData('id', id);
        setDraggedIndex(index);
        setDropIndex(index); // Initialize dropIndex with the dragged index
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDragEnter = (e, index) => {
        setDropIndex(index);
    };

    const handleDrop = async (e, targetIndex) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('id');

        if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
            const newRecordsData = [...recordsData];
            const [draggedItem] = newRecordsData.splice(draggedIndex, 1);
            newRecordsData.splice(targetIndex, 0, draggedItem);

            setRecordsData(newRecordsData);
        }

        setDraggedIndex(null); // Reset draggedIndex
        setDropIndex(null); // Reset dropIndex
    };

    const handleSave = async () => {
        const rearrangedProducts = recordsData.map((product, index) => ({
            productId: product.id,
            orderNo: index + 1,
        }));

        try {
            await reorder({
                variables: {
                    input: {
                        updates: rearrangedProducts,
                    },
                },
            });
            Success('Product list updated successfully');
        } catch (error) {
            console.error('Error reordering products:', error);
        }
    };

    const tableFormat = (products) => {
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

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
        fetchLowStockList({
            variables: {
                channel: 'india-channel',
                first: selectPage,
                after: null,
                search: search,
                sortBy: { direction: 'ASC', field: 'ORDER_NO' },
                filter: buildFilter(event.target.value, status),
            },
        });
    };

    const handleSelectPage = (e) => {
        setSelectPage(e.target.value);
        fetchLowStockList({
            variables: {
                channel: 'india-channel',
                first: e.target.value,
                after: null,
                search: search,
                sortBy: { direction: 'ASC', field: 'ORDER_NO' },
                filter: buildFilter(selectedCategory, status),
            },
        });
    };

    const filter = [10, 20, 50, 100, 200];

    const handlePageChange = (e) => {
        setSelectPage(e.target.value);
        if (e.target.value == '') {
            fetchLowStockList({
                variables: {
                    channel: 'india-channel',
                    first: 20,
                    after: null,
                    search: search,
                    filter: buildFilter(e.target.value, status),
                },
            });
        } else {
            fetchLowStockList({
                variables: {
                    channel: 'india-channel',
                    first: e.target.value,
                    after: null,
                    search: search,
                    filter: buildFilter(e.target.value, status),
                },
            });
        }
    };

    return (
        <div>
            <div className="panel mb-5 flex items-center justify-between gap-5">
                <div className="flex w-full items-center justify-between gap-5">
                    <h5 className="text-lg font-semibold dark:text-white-light">Merchandising</h5>
                    <button type="button" className="btn btn-outline-primary" onClick={() => handleSave()}>
                        {reorderLoading ?<IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Save Product'}
                    </button>
                </div>
            </div>
            <div className="mb-5 mt-5 flex justify-between md:mb-0 md:mt-0 md:flex md:ltr:ml-auto md:rtl:mr-auto">
                <div className="flex gap-5">
                    <input type="text" className="form-input mb-3 mr-2 h-[40px] md:mb-0 md:w-auto" placeholder="Search..." value={search} onChange={(e) => handleSearchChange(e.target.value)} />

                    <select className="form-select flex-1" value={selectPage} onChange={(e) => handlePageChange(e)}>
                        <option value="">Select a Page</option>
                        {filter.map((parent) => (
                            <option value={parent}>{parent}</option>
                        ))}
                    </select>
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
                        recordsData?.map((record, index) => (
                            <div
                                key={record.id}
                                className={`card ${draggedIndex === index ? 'dragging' : ''} ${dropIndex === index && draggedIndex !== null ? 'drag-over' : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, record.id, index)}
                                onDragOver={handleDragOver}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                <img src={isValidImageUrl(record?.image) ? record?.image : placeholders} alt={record?.name} className="h-48 w-full object-cover" />
                                <div className="mt-2 text-center">{record?.name}</div>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center">No Data Found</div>
                    )}
                </div>
            )}
            {/* <div className="mt-5 flex justify-end gap-3">
                <button disabled={!hasPreviousPage} onClick={handlePreviousPage} className={`btn ${!hasPreviousPage ? 'btn-disabled' : 'btn-primary'}`}>
                    <IconArrowBackward />
                </button>
                <button disabled={!hasNextPage} onClick={handleNextPage} className={`btn ${!hasNextPage ? 'btn-disabled' : 'btn-primary'}`}>
                    <IconArrowForward />
                </button>
            </div> */}
        </div>
    );
};

export default PrivateRouter(Index);
