import IconTrashLines from '@/components/Icon/IconTrashLines';
import {
    CREATE_PRODUCT,
    CREATE_VARIANT,
    DELETE_PRODUCTS,
    PARENT_CATEGORY_LIST,
    PRODUCT_FULL_DETAILS,
    PRODUCT_PREV_PAGINATION,
    UPDATED_PRODUCT_PAGINATION,
    UPDATE_META_DATA,
    UPDATE_PRODUCT_CHANNEL,
    UPDATE_VARIANT_LIST,
} from '@/query/product';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import CommonLoader from '../elements/commonLoader';
import { Failure, Success, formatCurrency, roundOff } from '@/utils/functions';
import Dropdown from '../../components/Dropdown';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import Swal from 'sweetalert2';
import IconEdit from '@/components/Icon/IconEdit';
import IconEye from '@/components/Icon/IconEye';
import IconArrowLeft from '@/components/Icon/IconArrowLeft';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import IconLoader from '@/components/Icon/IconLoader';

export default function LowStock() {
    const PAGE_SIZE = 20;

    const router = useRouter();

    const [recordsData, setRecordsData] = useState([]);
    const [startCursor, setStartCursor] = useState(null);
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [status, setStatus] = useState('');
    const [parentLists, setParentLists] = useState([]);
    const [selectedRecords, setSelectedRecords] = useState([]);
    const [loadingRows, setLoadingRows] = useState({});

    const [deleteProducts] = useMutation(DELETE_PRODUCTS);
    const { data: productDetails, refetch: productDetailsRefetch } = useQuery(PRODUCT_FULL_DETAILS);
    const [addFormData] = useMutation(CREATE_PRODUCT);
    const [updateProductChannelList] = useMutation(UPDATE_PRODUCT_CHANNEL);
    const [createVariant] = useMutation(CREATE_VARIANT);
    const [updateVariantList] = useMutation(UPDATE_VARIANT_LIST);
    const [updateMedatData] = useMutation(UPDATE_META_DATA);

    const tableRef = useRef(null);

    const buildFilter = (category, availability) => {
        const filter: any = {};
        if (router?.query?.category) {
            filter.categories = [router?.query?.category];
        } else {
            if (category && category !== '') {
                filter.categories = [category];
            }
        }
        if (availability) {
            filter.stockAvailability = availability;
        }
        return filter;
    };

    const { loading: getLoading, refetch: fetchLowStockList } = useQuery(UPDATED_PRODUCT_PAGINATION, {
        variables: {
            channel: 'india-channel',
            first: PAGE_SIZE,
            after: null,
            search: search,
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

    const checkStock = (variants) => {
        let stock = false;
        if (variants?.length > 0) {
            const total = variants.reduce((total, item) => total + item.quantityAvailable, 0);
            if (total > 0) {
                stock = true;
            }
        }
        return stock;
    };

    const tableFormat = (products) => {
        const newData = products?.map((item) => ({
            ...item.node,
            product: item.node.products?.totalCount,
            image: item.node.thumbnail?.url,
            categories: item.node.category?.name ? item.node.category.name : '-',
            date: item.node.updatedAt
                ? `Last Modified ${moment(item.node.updatedAt).format('YYYY/MM/DD [at] h:mm a')}`
                : `Published ${moment(item.node.channelListings[0]?.publishedAt).format('YYYY/MM/DD [at] h:mm a')}`,
            price: `${formatCurrency(item.node.pricing?.priceRange?.start?.gross?.currency)}${roundOff(item.node.pricing?.priceRange?.start?.gross?.amount)}`,
            status: item.node.channelListings[0]?.isPublished ? 'Published' : 'Draft',
            sku: item.node.defaultVariant ? item.node.defaultVariant.sku : '-',
            tags: item.node.tags?.length > 0 ? item.node.tags.map((tag) => tag.name).join(',') : '-',
            stock: checkStock(item.node.variants) ? 'In stock' : 'Out of stock',
        }));

        return newData;
    };

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
                filter: buildFilter(selectedCategory, status),
            },
        });
        // .then(() => {
        //     window.scrollTo({
        //         top: tableRef.current.offsetTop,
        //         behavior: 'smooth',
        //     });
        // });
    };

    const handlePreviousPage = () => {
        fetchPreviousPage({
            variables: {
                channel: 'india-channel',
                last: PAGE_SIZE,
                before: startCursor,
                search: search,
                filter: buildFilter(selectedCategory, status),
            },
        });
        // .then(() => {
        //     window.scrollTo({
        //         top: tableRef.current.offsetTop,
        //         behavior: 'smooth',
        //     });
        // });
    };

    const handleSearchChange = (e) => {
        setSearch(e);
        fetchLowStockList({
            variables: {
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: null,
                search: e,
                filter: buildFilter(selectedCategory, status),
            },
        });
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

    const handleStatusChange = (selectedStatus) => {
        setStatus(selectedStatus);
        fetchLowStockList({
            variables: {
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: null,
                search: search,
                filter: buildFilter(selectedCategory, selectedStatus),
            },
        });
    };

    const { data: parentList } = useQuery(PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });

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

    const BulkDeleteProduct = async () => {
        showDeleteAlert(
            () => {
                if (selectedRecords.length === 0) {
                    Swal.fire('Cancelled', 'Please select at least one record!', 'error');
                    return;
                }
                const productIds = selectedRecords?.map((item: any) => item.id);
                const { data }: any = deleteProducts({
                    variables: {
                        ids: productIds,
                    },
                });
                const updatedRecordsData = recordsData.filter((record) => !selectedRecords.includes(record));
                setRecordsData(updatedRecordsData);
                setSelectedRecords([]);
                fetchLowStockList({
                    variables: {
                        channel: 'india-channel',
                        first: PAGE_SIZE,
                        after: null,
                        search: search,
                        filter: buildFilter(selectedCategory, status),
                    },
                });
                Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Product List is safe :)', 'error');
            }
        );
    };

    const showDeleteAlert = (onConfirm: () => void, onCancel: () => void) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-secondary',
                cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
                popup: 'sweet-alerts',
            },
            buttonsStyling: false,
        });

        swalWithBootstrapButtons
            .fire({
                title: 'Are you sure?',
                text: "You won't be able to Delete this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, cancel!',
                reverseButtons: true,
                padding: '2em',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    onConfirm(); // Call the onConfirm function if the user confirms the deletion
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    onCancel(); // Call the onCancel function if the user cancels the deletion
                }
            });
    };

    const DeleteProduct = (record: any) => {
        showDeleteAlert(
            () => {
                const { data }: any = deleteProducts({
                    variables: {
                        ids: [record.id],
                    },
                });
                const updatedRecordsData = recordsData.filter((dataRecord: any) => dataRecord.id !== record.id);
                setRecordsData(updatedRecordsData);
                fetchLowStockList({
                    variables: {
                        channel: 'india-channel',
                        first: PAGE_SIZE,
                        after: null,
                        search: search,
                        filter: buildFilter(selectedCategory, status),
                    },
                });
                Swal.fire('Deleted!', 'Your Product has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Product List is safe :)', 'error');
            }
        );
    };

    const duplicate = async (row: any) => {
        try {
            setLoadingRows((prev) => ({ ...prev, [row.id]: true }));
            // productDetailsRefetch()
            const res = await productDetailsRefetch({
                channel: 'india-channel',
                id: row.id,
            });
            const response = res.data?.product;

            CreateDuplicateProduct(response);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const CreateDuplicateProduct = async (row: any) => {
        try {
            let collectionId: any = [];

            if (row?.collections?.length > 0) {
                collectionId = row?.collections.map((item: any) => item.id);
            }
            let tagId: any[] = [];
            if (row?.tags?.length > 0) {
                tagId = row?.tags?.map((item: any) => item.id);
            }

            let finish = [];
            if (row?.productFinish?.length > 0) {
                finish = row?.productFinish?.map((item: any) => item.id);
            }

            let design = [];
            if (row?.prouctDesign?.length > 0) {
                design = row?.prouctDesign?.map((item: any) => item.id);
            }

            let style = [];
            if (row?.productstyle?.length > 0) {
                style = row?.productstyle?.map((item: any) => item.id);
            }

            let stone = [];
            if (row?.productStoneType?.length > 0) {
                stone = row?.productStoneType?.map((item: any) => item.id);
            }

            let size = [];
            if (row?.productSize?.length > 0) {
                size = row?.productSize?.map((item: any) => item.id);
            }

            let upsells = [];
            if (row?.getUpsells?.length > 0) {
                upsells = row?.getUpsells?.map((item: any) => item?.productId);
            }
            let crosssells = [];
            if (row?.getCrosssells?.length > 0) {
                crosssells = row?.getCrosssells?.map((item: any) => item?.productId);
            }

            const { data } = await addFormData({
                variables: {
                    input: {
                        attributes: [],
                        category: row?.category?.id,
                        collections: collectionId,
                        description: row.description,
                        tags: tagId,
                        upsells,
                        crosssells,
                        // description: formattedDescription,
                        name: row.name,
                        productType: row.productType?.id,
                        seo: {
                            description: row.seoDescription,
                            title: row.seoTitle,
                        },
                        slug: row.slug + '-1',
                        order_no: row.orderNo,
                        prouctDesign: design,
                        productstyle: style,
                        productFinish: finish,
                        productStoneType: stone,
                        productSize: size,
                    },
                },
            });

            if (data?.productCreate?.errors?.length > 0) {
                Failure(data?.productCreate?.errors[0]?.message);
                
                setLoadingRows((prev) => ({ ...prev, [row.id]: false }));
            } else {
                const productId = data?.productCreate?.product?.id;
                productChannelListUpdate(productId, row);
                // if (row?.media?.length > 0) {
                //     row?.media?.map((item: any) => {
                //         const imageUpload = duplicateUploadImage(productId, item.url);
                //         console.log('imageUpload: ', imageUpload);
                //     });
                // }
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const productChannelListUpdate = async (productId: any, row: any) => {
        try {
            const { data } = await updateProductChannelList({
                variables: {
                    id: productId,
                    input: {
                        updateChannels: [
                            {
                                availableForPurchaseDate: null,
                                channelId: 'Q2hhbm5lbDoy',
                                isAvailableForPurchase: true,
                                isPublished: row?.channelListings[0]?.isPublished,
                                publicationDate: null,
                                visibleInListings: true,
                            },
                        ],
                    },
                },
                // variables: { email: formData.email, password: formData.password },
            });
            if (data?.productChannelListingUpdate?.errors?.length > 0) {
                console.log('error: ', data?.productChannelListingUpdate?.errors[0]?.message);
                Failure(data?.productChannelListingUpdate?.errors[0]?.message);
                deleteDuplicateProduct(productId,row);
                
                setLoadingRows((prev) => ({ ...prev, [row.id]: false }));
            } else {

                variantListUpdate(productId, row);
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const variantListUpdate = async (productId: any, row: any) => {
        try {
            let variants = [];
            if (row.variants.length > 0) {
                const variantArr = row.variants?.map((item: any, index: any) => ({
                    attributes: [],
                    sku: `${item.sku}-1`,
                    name: item.name,
                    trackInventory: item.trackInventory,
                    channelListings: [
                        {
                            channelId: 'Q2hhbm5lbDoy',
                            price: item.channelListings[0]?.price?.amount ? item.channelListings[0]?.price?.amount : '',
                            costPrice: item.channelListings[0]?.costPrice?.amount ? item.channelListings[0]?.costPrice?.amount : '',
                        },
                    ],
                    stocks: [
                        {
                            warehouse: 'V2FyZWhvdXNlOmRmODMzODUzLTQyMGYtNGRkZi04YzQzLTVkMzdjMzI4MDRlYQ==',
                            quantity: item?.stocks?.length > 0 ? item?.stocks[0]?.quantity : 1,
                        },
                    ],
                }));
                variants = variantArr;
            }

            const { data } = await createVariant({
                variables: {
                    id: productId,
                    inputs: variants,
                },
                // variables: { email: formData.email, password: formData.password },
            });
            if (data?.productVariantBulkCreate?.errors?.length > 0) {
                Failure(data?.productVariantBulkCreate?.errors[0]?.message);
                deleteDuplicateProduct(productId,row);
                
                setLoadingRows((prev) => ({ ...prev, [row.id]: false }));
            } else {
                const resVariants = data?.productVariantBulkCreate?.productVariants;

                // const varArr = row?.variants.forEach((variant) => {
                //     variant.channelListings.forEach((channelListing) => {
                //         if (channelListing.channel.name === 'India Channel') {
                //             variantChannelListUpdate(channelListing, productId, variant.id, row);
                //         }
                //     });
                // });
                if (resVariants?.length > 0) {
                    const mergedVariants = row?.variants.map((variant: any, index: number) => ({
                        ...variant,
                        variantId: resVariants[index]?.id || null,
                    }));
                    const varArr = mergedVariants.forEach((variant) => {
                        variant.channelListings.forEach((channelListing) => {
                            if (channelListing.channel.name === 'India Channel') {
                                variantChannelListUpdate(channelListing?.price?.amount, productId, variant.variantId, row);
                            }
                        });
                    });
                } else {
                    updateMetaData(productId, row);
                }
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const variantChannelListUpdate = async (price: any, productId: any, variantId: any, row: any) => {
        try {
            const { data } = await updateVariantList({
                variables: {
                    id: variantId,
                    input: [
                        {
                            channelId: 'Q2hhbm5lbDoy',
                            price: price,
                            costPrice: price,
                        },
                    ],
                },
                // variables: { email: formData.email, password: formData.password },
            });
            if (data?.productVariantChannelListingUpdate?.errors?.length > 0) {
                Failure(data?.productVariantChannelListingUpdate?.errors[0]?.message);
                deleteDuplicateProduct(productId,row);
                
                setLoadingRows((prev) => ({ ...prev, [row.id]: false }));
            } else {
                updateMetaData(productId, row);
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const updateMetaData = async (productId: any, row: any) => {
        try {
            let metadata = [];
            if (row.metadata?.length > 0) {
                metadata = row.metadata?.map((item: any) => ({ key: item.key, value: item.value }));
            }
            const { data } = await updateMedatData({
                variables: {
                    id: productId,
                    input: metadata,
                    keysToDelete: [],
                },
                // variables: { email: formData.email, password: formData.password },
            });
            if (data?.updateMetadata?.errors?.length > 0) {
                Failure(data?.updateMetadata?.errors[0]?.message);
                deleteDuplicateProduct(productId,row);
                
                setLoadingRows((prev) => ({ ...prev, [row.id]: false }));
            } else {
                // if (selectedTag?.length > 0) {
                //     assignsTagToProduct(productId);
                //     console.log('success: ', data);
                // }
                router.push(`/apps/product/edit?id=${productId}`);
                Success('Product created successfully');
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const deleteDuplicateProduct = async (productId: any,row:any) => {
        try {
            const { data }: any = deleteProducts({
                variables: {
                    ids: [productId],
                },
            });
            
            setLoadingRows((prev) => ({ ...prev, [row.id]: false }));
        } catch (error) {
            console.log('error: ', error);
        }
    };

    return (
        <div className="">
            <div className="panel mb-5 flex items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                    <h5 className="text-lg font-semibold dark:text-white-light">Product</h5>
                    <button type="button" className="btn btn-outline-primary" onClick={() => router.push('/product_import')}>
                        Import
                    </button>
                    <button type="button" className="btn btn-outline-primary" onClick={() => router.push('/product_export')}>
                        Export
                    </button>
                </div>
                <div>
                    <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => router.push('/apps/product/add')}>
                        + Create
                    </button>
                </div>
            </div>
            <div className="mb-5 mt-5 justify-between  md:mt-0 md:flex md:ltr:ml-auto md:rtl:mr-auto">
                <input type="text" className="w-82 form-input mb-3 mr-2 h-[40px] md:mb-0 md:w-auto" placeholder="Search..." value={search} onChange={(e) => handleSearchChange(e.target.value)} />
                <div className="dropdown mb-3 mr-0 md:mb-0 md:mr-2 ">
                    <Dropdown
                        btnClassName="btn btn-outline-primary dropdown-toggle  lg:w-auto w-full"
                        button={
                            <>
                                Bulk Actions
                                <span>
                                    <IconCaretDown className="inline-block ltr:ml-1 rtl:mr-1" />
                                </span>
                            </>
                        }
                    >
                        <ul className="!min-w-[170px]">
                            <li>
                                <button type="button" onClick={() => BulkDeleteProduct()}>
                                    Delete
                                </button>
                            </li>
                        </ul>
                    </Dropdown>
                </div>
            </div>
            <div className="col-4 mx-auto  mb-5 flex items-center gap-4 md:flex-row">
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
                <select className="form-select flex-1" value={status} onChange={(e) => handleStatusChange(e.target.value)}>
                    <option value="">Select a Status</option>
                    <option value="IN_STOCK">In Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
            </div>
            <div className="datatables" ref={tableRef}>
                {getLoading ? (
                    <CommonLoader />
                ) : (
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={recordsData}
                        columns={[
                            { accessor: 'image', sortable: true, render: (row) => <img src={row.image} alt="Product" className="h-10 w-10 object-cover ltr:mr-2 rtl:ml-2" /> },
                            {
                                accessor: 'name',
                                sortable: true,
                                render: (row,index) => (
                                    <>
                                        <div className="">{row.name}</div>
                                        <button onClick={() => duplicate(row)} className=" cursor-pointer text-blue-400 underline">
                                            {loadingRows[row.id]  ? "...Loading" : 'Duplicate'}
                                        </button>
                                    </>
                                ),
                            },
                            { accessor: 'sku', sortable: true, title: 'SKU' },
                            { accessor: 'stock', sortable: false },
                            { accessor: 'status', sortable: true },
                            { accessor: 'price', sortable: true },
                            { accessor: 'categories', sortable: true },
                            {
                                accessor: 'tags',
                                sortable: true,
                                width: 200,
                                render: (row) => <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', overflow: 'hidden', width: '200px' }}>{row.tags}</div>,
                            },
                            {
                                accessor: 'date',
                                sortable: true,
                                width: 160,
                                render: (row) => <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', overflow: 'hidden', width: '160px' }}>{row.date}</div>,
                            },
                            {
                                accessor: 'actions',
                                title: 'Actions',
                                render: (row: any) => (
                                    <>
                                        <div className="mx-auto flex w-max items-center gap-4">
                                            <button className="flex hover:text-info" onClick={() => router.push(`/apps/product/edit?id=${row.id}`)}>
                                                <IconEdit className="h-4.5 w-4.5" />
                                            </button>
                                            {/* {row?.status == 'Published' && ( */}
                                            <button
                                                className="flex hover:text-info"
                                                onClick={() => {
                                                    if (row.status == 'Draft') {
                                                        Failure('Product is Draft !');
                                                    } else {
                                                        window.open(`http://www1.prade.in/product-details/${row.id}`, '_blank'); // '_blank' parameter opens the link in a new tab
                                                    }
                                                }}
                                            >
                                                {/* <Link href="/apps/product/view" className="flex hover:text-primary"> */}
                                                <IconEye />
                                            </button>
                                            {/* )} */}

                                            <button type="button" className="flex hover:text-danger" onClick={() => DeleteProduct(row)}>
                                                <IconTrashLines />
                                            </button>
                                        </div>
                                    </>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={recordsData?.length}
                        recordsPerPage={PAGE_SIZE}
                        minHeight={200}
                        page={null}
                        onPageChange={(p) => {}}
                        withBorder={true}
                        sortStatus={null}
                        onSortStatusChange={()=>{}}
                        selectedRecords={selectedRecords}
                        onSelectedRecordsChange={(val) => setSelectedRecords(val)}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                )}
            </div>
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
}
