import IconTrashLines from '@/components/Icon/IconTrashLines';
import {
    CREATE_PRODUCT,
    CREATE_VARIANT,
    DELETE_PRODUCTS,
    PARENT_CATEGORY_LIST,
    PRODUCT_FULL_DETAILS,
    PRODUCT_LIST_TAGS,
    PRODUCT_PREV_PAGINATION,
    UPDATED_PRODUCT_PAGINATION,
    UPDATE_META_DATA,
    UPDATE_PRODUCT,
    UPDATE_PRODUCT_CHANNEL,
    UPDATE_VARIANT,
    UPDATE_VARIANT_LIST,
} from '@/query/product';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState, Fragment } from 'react';
import CommonLoader from './elements/commonLoader';
import { Failure, Success, formatCurrency, formatOptions, roundOff } from '@/utils/functions';
import Dropdown from '../components/Dropdown';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import Swal from 'sweetalert2';
import IconEdit from '@/components/Icon/IconEdit';
import IconEye from '@/components/Icon/IconEye';
import IconArrowLeft from '@/components/Icon/IconArrowLeft';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import IconLoader from '@/components/Icon/IconLoader';
import { sortBy } from 'lodash';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import QuickEdit from '@/components/quickEdit';
import { Dialog, Transition } from '@headlessui/react';
import Select from 'react-select';
import IconMenuReport from '@/components/Icon/Menu/IconMenuReport';
import IconX from '@/components/Icon/IconX';

const Index = () => {
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
    const [categoryOption, setCategoryOption] = useState([]);
    const [tagOption, setTagOption] = useState([]);
    const [selectedRecords, setSelectedRecords] = useState([]);
    const [selectedCat, setSelectedCat] = useState([]);
    const [selectedTag, setSelectedTag] = useState([]);
    const [variantName, setVariantName] = useState('');
    const [variantIsStackMgmt, setVariantIsStackMgmt] = useState(false);
    const [variantQuantity, setVariantQuantity] = useState(0);
    const [variantPrice, setVariantPrice] = useState(0);
    const [variantStatus, setVariantStatus] = useState('');
    const [menuOrder, setMenuOrder] = useState(null);
    const [loadingRows, setLoadingRows] = useState({});
    const [expandedRow, setExpandedRow] = useState(null);
    const [isBulkEdit, setIsBulkEdit] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [bulkEditLoading, setBulkEditLoading] = useState(false);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [deleteProducts] = useMutation(DELETE_PRODUCTS);
    const { data: productDetails, refetch: productDetailsRefetch } = useQuery(PRODUCT_FULL_DETAILS);
    const [addFormData] = useMutation(CREATE_PRODUCT);
    const [updateProductChannelList] = useMutation(UPDATE_PRODUCT_CHANNEL);
    const [createVariant] = useMutation(CREATE_VARIANT);
    const [updateVariantList] = useMutation(UPDATE_VARIANT_LIST);
    const [updateMedatData] = useMutation(UPDATE_META_DATA);
    const { refetch: refreshfetch } = useQuery(UPDATED_PRODUCT_PAGINATION);
    const [updateProduct] = useMutation(UPDATE_PRODUCT);
    const [updateVariant] = useMutation(UPDATE_VARIANT);

    const { data: parentList } = useQuery(PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });
    const { data: tagsList, refetch: tagListRefetch } = useQuery(PRODUCT_LIST_TAGS, {
        variables: { channel: 'india-channel' },
    });

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

    useEffect(() => {
        const data = sortBy(recordsData, sortStatus.columnAccessor);
        setRecordsData(recordsData);
    }, [sortStatus]);

    useEffect(() => {
        if (parentList) {
            setParentLists(getParentCategories());
        }
    }, [parentList]);

    useEffect(() => {
        const getparentCategoryList = parentList?.categories?.edges;
        const options = formatOptions(getparentCategoryList);
        setCategoryOption(options);
    }, [parentList]);

    useEffect(() => {
        tags_list();
    }, [tagsList]);

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

    const refresh = async () => {
        try {
            const { data } = await refreshfetch({
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: null,
                search: '',
            });
            const products = data?.products?.edges || [];
            setRecordsData(tableFormat(products));
            setStartCursor(data?.products?.pageInfo?.startCursor || null);
            setEndCursor(data?.products?.pageInfo?.endCursor || null);
            setHasNextPage(data?.products?.pageInfo?.hasNextPage || false);
            setHasPreviousPage(data?.products?.pageInfo?.hasPreviousPage || false);
            Success('Product updated successfully');
        } catch (error) {
            console.log('error: ', error);
        }
    };

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

    const productImg = (item) => {
        let img = '';
        const mp4Formats = ['.mp4', '.webm'];
        const imgFormats = ['.jpeg', '.png', '.jpg', '.webp'];

        const endsWithAny = (url, formats) => formats.some((format) => url?.endsWith(format));

        if (endsWithAny(item?.thumbnail?.url, mp4Formats)) {
            const find = item?.media?.find((mediaItem) => endsWithAny(mediaItem.url, imgFormats));
            img = find?.url || '';
        } else {
            img = item?.thumbnail?.url || '';
        }

        return img;
    };

    const tableFormat = (products) => {
        const newData = products?.map((item) => ({
            ...item.node,
            product: item.node.products?.totalCount,
            image: productImg(item?.node),
            categories: item.node.category?.length > 0 ? item.node?.category?.map((cats) => cats?.name).join(',') : '-',
            // categories: item.node.category?.name ? item.node.category.name : '-',
            date: item.node.updatedAt
                ? `Last Modified ${moment(item.node.updatedAt).format('YYYY/MM/DD [at] h:mm a')}`
                : `Published ${moment(item.node.channelListings[0]?.publishedAt).format('YYYY/MM/DD [at] h:mm a')}`,
            price: `${formatCurrency(item.node.pricing?.priceRange?.start?.gross?.currency)}${roundOff(item.node.pricing?.priceRange?.start?.gross?.amount)}`,
            status: item.node.channelListings[0]?.isPublished ? 'Published' : 'Draft',
            sku: item.node.defaultVariant ? item.node.defaultVariant.sku : '-',
            tags: item.node.tags?.length > 0 ? item.node?.tags?.map((tag) => tag?.name).join(',') : '-',
            stock: checkStock(item.node.variants) ? 'In stock' : 'Out of stock',
            id: item.node.id,
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
    };

    const handleSearchChange = (e) => {
        console.log('handleSearchChange: ');
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
        console.log('e.target.value: ', e.target.value);
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

    const tags_list = async () => {
        try {
            if (tagsList) {
                if (tagsList && tagsList?.tags?.edges?.length > 0) {
                    const list = tagsList?.tags?.edges;
                    const dropdownData = list?.map((item: any) => {
                        return { value: item.node?.id, label: item.node?.name };
                    });
                    setTagOption(dropdownData);
                }
            }
        } catch (error) {
            console.log('error: ', error);
        }
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
        console.log('row: ', row);
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
                        category: row?.category?.map((item) => item.id),
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
                console.log('error: ', data?.productCreate?.errors[0]?.message);

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
                deleteDuplicateProduct(productId, row);

                setLoadingRows((prev) => ({ ...prev, [row.id]: false }));
            } else {
                console.log('productChannelListUpdate: ', data);

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
                            quantity: item?.stocks?.length > 0 ? item?.stocks[0]?.quantity : 0,
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
                deleteDuplicateProduct(productId, row);

                setLoadingRows((prev) => ({ ...prev, [row.id]: false }));
            } else {
                const resVariants = data?.productVariantBulkCreate?.productVariants;
                console.log('resVariants: ', resVariants);

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
                    console.log('mergedVariants: ', mergedVariants);
                    const varArr = mergedVariants.forEach((variant) => {
                        variant.channelListings.forEach((channelListing) => {
                            if (channelListing.channel.name === 'India Channel') {
                                console.log('channelListing: ', channelListing);
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
                deleteDuplicateProduct(productId, row);

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
                deleteDuplicateProduct(productId, row);
                console.log('error: ', data?.updateMetadata?.errors[0]?.message);

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

    const deleteDuplicateProduct = async (productId: any, row: any) => {
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

    const selectedRows = (val) => {
        const hasMultipleVariants = val?.some((item) => item?.variants.length > 1);
        setIsBulkEdit(hasMultipleVariants);
        setSelectedRecords(val);
    };

    const bulkEdit = () => {
        if (selectedRecords?.length == 0) {
            Failure('Please select products');
        } else if (isBulkEdit) {
            Failure('selected products is multi variants');
        } else {
            setIsEditOpen(true);
        }
    };

    const getProductDetailsById = async (id: any) => {
        try {
            const res = await productDetailsRefetch({
                channel: 'india-channel',
                id,
            });
            const response = res.data?.product;
            return response;
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const bulkUpdates = async () => {
        try {
            setBulkEditLoading(true);
            selectedRecords?.map(async (item) => {
                const res = await getProductDetailsById(item.id);
                console.log('res: ', res);
                const input = {
                    attributes: [],
                    category: selectedCat?.map((item) => item?.value),
                    collections: res?.collections?.length > 0 ? res?.collections.map((item) => item.id) : [],
                    tags: selectedTag?.length > 0 ? selectedTag?.map((item) => item?.value) : [],
                    name: res?.name,
                    description: res?.description,
                    rating: 0,
                    seo: {
                        description: res?.seoDescription,
                        title: res?.seoTitle,
                    },
                    upsells: res?.getUpsells?.length > 0 ? res?.getUpsells.map((item) => item.productId) : [],
                    crosssells: res?.getCrosssells?.length > 0 ? res?.getCrosssells.map((item) => item.productId) : [],
                    slug: res?.slug,
                    order_no: menuOrder,
                    prouctDesign: res?.prouctDesign?.length > 0 ? res?.prouctDesign?.map((item) => item.id) : [],
                    productstyle: res?.productstyle?.length > 0 ? res?.productstyle?.map((item) => item.id) : [],
                    productFinish: res?.productFinish?.length > 0 ? res?.productFinish?.map((item) => item.id) : [],
                    productStoneType: res?.productStoneType?.length > 0 ? res?.productStoneType?.map((item) => item.id) : [],
                    productItemtype: res?.productItemtype?.length > 0 ? res?.productItemtype?.map((item) => item.id) : [],
                    productSize: res?.productSize?.length > 0 ? res?.productSize?.map((item) => item.id) : [],
                    productStonecolor: res?.productStonecolor?.length > 0 ? res?.productStonecolor?.map((item) => item.id) : [],
                };
                console.log('input: ', input);

                const { data } = await updateProduct({
                    variables: {
                        id: res?.id,
                        input,
                        firstValues: 10,
                    },
                });

                if (data?.productUpdate?.errors?.length > 0) {
                    Failure(data?.productUpdate?.errors[0]?.message);

                    setBulkEditLoading(false);
                } else {
                    bulkEditproductChannelListUpdate(res);
                }
            });
        } catch (error) {
            setBulkEditLoading(false);

            console.log('error: ', error);
        }
    };

    const bulkEditproductChannelListUpdate = async (res) => {
        try {
            const { data } = await updateProductChannelList({
                variables: {
                    id: res.id,
                    input: {
                        updateChannels: [
                            {
                                availableForPurchaseDate: null,
                                channelId: 'Q2hhbm5lbDoy',
                                isAvailableForPurchase: true,
                                isPublished: variantStatus == 'draft' ? false : true,
                                publicationDate: null,
                                visibleInListings: true,
                            },
                        ],
                    },
                },
                // variables: { email: formData.email, password: formData.password },
            });
            if (data?.productChannelListingUpdate?.errors?.length > 0) {
                setBulkEditLoading(false);

                Failure(data?.productChannelListingUpdate?.errors[0]?.message);
            } else {
                bulkEditVariantListUpdate(res);
            }
        } catch (error) {
            setBulkEditLoading(false);

            console.log('error: ', error);
        }
    };

    const bulkEditVariantListUpdate = async (res) => {
        try {
            const arrayOfVariants = res?.variants?.map((item: any) => ({
                attributes: [],
                id: item.id,
                sku: item?.sku,
                name: variantName,
                trackInventory: variantIsStackMgmt,
                channelListings: {
                    update: [
                        {
                            channelListing: item.channelListings[0]?.id,
                            price: variantPrice,
                            costPrice: variantPrice,
                        },
                    ],
                },
                stocks: {
                    update: [
                        {
                            quantity: variantQuantity,
                            stock: item?.stocks[0]?.id,
                        },
                    ],
                },
            }));

            const updateArr = arrayOfVariants.filter((item) => item.id != undefined);

            const { data } = await updateVariant({
                variables: {
                    product: res?.id,
                    input: updateArr,
                    errorPolicy: 'REJECT_FAILED_ROWS',
                },
            });

            if (data?.productVariantBulkUpdate?.errors?.length > 0) {
                setBulkEditLoading(false);
                Failure(data?.productVariantBulkUpdate?.errors[0]?.message);
            } else {
                refresh();
                setSelectedRecords([]);
                setIsEditOpen(false);
                setBulkEditLoading(false);
                setVariantName('');
                setVariantPrice(0);
                setSelectedCat([]);
                setSelectedTag([]);
                setVariantIsStackMgmt(false);
                setVariantQuantity(0);
                setVariantStatus('');
                setMenuOrder(null);
            }
        } catch (error) {
            setBulkEditLoading(false);

            console.log('error: ', error);
        }
    };

    const removeSelectedRecords = (row) => {
        const filter = selectedRecords?.filter((item) => item.id !== row.id);
        if (filter?.length > 0) {
            setSelectedRecords(filter);
        } else {
            setSelectedRecords(filter);
            setIsEditOpen(false);
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
                                <button type="button" onClick={() => bulkEdit()}>
                                    Edit
                                </button>
                            </li>
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
                                render: (row, index) => (
                                    <>
                                        <div className="">{row.name}</div>
                                        <div className="flex gap-3">
                                            <button onClick={() => duplicate(row)} className=" cursor-pointer text-blue-400 underline">
                                                {loadingRows[row.id] ? '...Loading' : 'Duplicate'}
                                            </button>

                                            <button onClick={() => setExpandedRow(row.id === expandedRow ? null : row.id)} className=" cursor-pointer text-blue-400 underline">
                                                Quick Edit
                                            </button>
                                        </div>
                                    </>
                                ),
                            },
                            { accessor: 'sku', sortable: true, title: 'SKU' },
                            { accessor: 'stock', sortable: false },
                            { accessor: 'status', sortable: true },
                            { accessor: 'price', sortable: true },
                            {
                                accessor: 'categories',
                                sortable: true,

                                render: (row) => <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', overflow: 'hidden', width: '200px' }}>{row.categories}</div>,
                            },
                            // {
                            //     accessor: 'tags',
                            //     sortable: true,
                            //     width: 200,
                            //     render: (row) => <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', overflow: 'hidden', width: '200px' }}>{row.tags}</div>,
                            // },
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
                                                <IconEye />
                                            </button>

                                            <button type="button" className="flex hover:text-danger" onClick={() => DeleteProduct(row)}>
                                                <IconTrashLines />
                                            </button>

                                            <button type="button" className="flex" onClick={() => router.push(`/apps/product/log?id=${row.id}`)}>
                                                <IconMenuReport />
                                            </button>
                                        </div>
                                    </>
                                ),
                            },
                        ]}
                        rowExpansion={{
                            collapseProps: {
                                transitionDuration: 500,
                                animateOpacity: false,
                                transitionTimingFunction: 'ease-out',
                            },
                            allowMultiple: false,
                            content: ({ record }) =>
                                expandedRow === record.id ? (
                                    <div>
                                        <QuickEdit data={record} updateList={refresh} closeExpand={() => setExpandedRow(null)} />
                                    </div>
                                ) : null,
                        }}
                        highlightOnHover
                        totalRecords={recordsData?.length}
                        recordsPerPage={PAGE_SIZE}
                        minHeight={200}
                        page={null}
                        onPageChange={(p) => {}}
                        withBorder={true}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        selectedRecords={selectedRecords}
                        onSelectedRecordsChange={(val) => {
                            selectedRows(val);
                        }}
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
            <Transition appear show={isEditOpen} as={Fragment}>
                <Dialog as="div" open={isEditOpen} onClose={() => setIsEditOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel as="div" className="panel my-8 w-full    rounded-lg border-0 bg-[#fbfbfb] p-0 text-black">
                                    <div className="flex items-center justify-between bg-white px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">{'BULK EDIT'}</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setIsEditOpen(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="flex gap-4 p-4">
                                        <div className="panel w-3/12 px-5 ">
                                            <div className="text-md font-bold">{'Products'}</div>
                                            <div className="">
                                                {selectedRecords?.map((item) => (
                                                    <div className="flex cursor-pointer items-center gap-3 pt-3" onClick={() => removeSelectedRecords(item)}>
                                                        <button type="button" className="hover:text-red text-red" onClick={() => setIsEditOpen(false)}>
                                                            <IconX />
                                                        </button>
                                                        <div className="text-sm">{item?.name}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="panel w-9/12 px-5 ">
                                            <div className="">
                                                <div className="mb-5 border-b border-gray-200 pb-2">
                                                    <h5 className=" block text-lg font-medium text-gray-700">Product Categories</h5>
                                                </div>
                                                <div className="">
                                                    <Select
                                                        isMulti
                                                        value={selectedCat}
                                                        onChange={(e: any) => setSelectedCat(e)}
                                                        options={categoryOption}
                                                        placeholder="Select categories..."
                                                        // className="form-select"
                                                    />

                                                    {/* {categoryErrMsg && <p className="error-message mt-1 text-red-500 ">{categoryErrMsg}</p>} */}
                                                </div>

                                                <div className="mb-5 mt-4 border-b border-gray-200 pb-2">
                                                    <h5 className=" block text-lg font-medium text-gray-700">Product Tags</h5>
                                                </div>
                                                <div className="">
                                                    <Select
                                                        placeholder="Select Tags"
                                                        options={tagOption}
                                                        value={selectedTag}
                                                        onChange={(data: any) => setSelectedTag(data)}
                                                        isSearchable={true}
                                                        isMulti
                                                    />

                                                    {/* {categoryErrMsg && <p className="error-message mt-1 text-red-500 ">{categoryErrMsg}</p>} */}
                                                </div>
                                                <div className="mb-5 mt-4 border-b border-gray-200 pb-2">
                                                    <h5 className=" block text-lg font-medium text-gray-700">Variants</h5>
                                                </div>
                                                <div>
                                                    <div className="mb-5  ">
                                                        <div className="active flex items-center">
                                                            <div className="mb-5 mr-4">
                                                                <label htmlFor={`name`} className="block pr-5 text-sm font-medium text-gray-700">
                                                                    Variant
                                                                </label>
                                                            </div>
                                                            <div className="mb-5" style={{ width: '80%' }}>
                                                                <input
                                                                    type="text"
                                                                    id={`name`}
                                                                    name={`name`}
                                                                    value={variantName}
                                                                    onChange={(e) => setVariantName(e.target.value)}
                                                                    style={{ width: '100%' }}
                                                                    placeholder="Enter variants"
                                                                    className="form-input"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/* <div className="active flex items-center">
                                                            <div className="mb-5 w-1/12 ">
                                                                <label htmlFor={`sku`} className="block pr-5 text-sm font-medium text-gray-700">
                                                                    SKU
                                                                </label>
                                                            </div>
                                                            <div className="mb-5 w-9/12">
                                                                <input
                                                                    type="text"
                                                                    id={`sku`}
                                                                    name={`sku`}
                                                                    value={variantSku}
                                                                    onChange={(e) => setVariantSku(e.target.value)}
                                                                    style={{ width: '100%' }}
                                                                    placeholder="Enter SKU"
                                                                    className="form-input"
                                                                />
                                                            </div>
                                                        </div> */}
                                                        <div className="active flex items-center">
                                                            <div className="mb-5 mr-4 pr-4">
                                                                <label htmlFor={`stackMgmt`} className="block  text-sm font-medium text-gray-700">
                                                                    Stock Management
                                                                </label>
                                                            </div>
                                                            <div className="mb-5" style={{ width: '80%' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    id={`stackMgmt`}
                                                                    name={`stackMgmt`}
                                                                    checked={variantIsStackMgmt}
                                                                    onChange={(e) => setVariantIsStackMgmt(e.target.checked)}
                                                                    className="form-checkbox"
                                                                />
                                                                <span>Track stock quantity for this product</span>
                                                                {/* {variantErrors[index]?.stackMgmt && <p className="error-message mt-1 text-red-500">{variantErrors[index].stackMgmt}</p>} */}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="active flex items-center">
                                                                <div className="mb-5 mr-7">
                                                                    <label htmlFor={`quantity`} className="block  text-sm font-medium text-gray-700">
                                                                        Quantity
                                                                    </label>
                                                                </div>
                                                                <div className="mb-5" style={{ width: '80%' }}>
                                                                    <input
                                                                        type="number"
                                                                        id={`quantity`}
                                                                        name={`quantity`}
                                                                        value={variantQuantity}
                                                                        onChange={(e) => setVariantQuantity(parseInt(e.target.value))}
                                                                        style={{ width: '100%' }}
                                                                        placeholder="Enter Quantity"
                                                                        className="form-input"
                                                                    />
                                                                    {/* {variantErrors[index]?.quantity && <p className="error-message mt-1 text-red-500">{variantErrors[index].quantity}</p>} */}
                                                                </div>
                                                            </div>
                                                            <div className="active flex items-center">
                                                                <div className="mb-5 mr-8">
                                                                    <label htmlFor={`regularPrice`} className="block pr-5 text-sm font-medium text-gray-700">
                                                                        Price
                                                                    </label>
                                                                </div>
                                                                <div className="mb-5">
                                                                    <input
                                                                        type="number"
                                                                        id={`regularPrice`}
                                                                        name={`regularPrice`}
                                                                        value={variantPrice}
                                                                        onChange={(e) => setVariantPrice(parseFloat(e.target.value))}
                                                                        style={{ width: '100%' }}
                                                                        placeholder="Enter Regular Price"
                                                                        className="form-input"
                                                                    />
                                                                    {/* {variantErrors[index]?.regularPrice && <p className="error-message mt-1 text-red-500">{variantErrors[index].regularPrice}</p>} */}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex w-full gap-5">
                                                            <div className="active w-6/12  items-center">
                                                                <h5 className=" block text-lg font-medium text-gray-700">Status</h5>
                                                                <div className="mb-5 w-full pr-3">
                                                                    <select className="form-select  flex-1 " value={variantStatus} onChange={(e) => setVariantStatus(e.target.value)}>
                                                                        <option value="published">Published</option>
                                                                        <option value="draft">Draft</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="active w-6/12  items-center">
                                                                <h5 className=" block text-lg font-medium text-gray-700">Menu Order</h5>
                                                                <div className="mb-5 w-full pr-3">
                                                                    <input
                                                                        type="number"
                                                                        name={`menuOrder`}
                                                                        value={menuOrder}
                                                                        onChange={(e) => setMenuOrder(e.target.value)}
                                                                        style={{ width: '100%' }}
                                                                        placeholder="Product Order Number"
                                                                        className="form-input"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end gap-5">
                                                            <button type="submit" className="btn btn-primary " onClick={() => bulkUpdates()}>
                                                                {bulkEditLoading ? <IconLoader /> : 'Update'}
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                className="btn btn-danger "
                                                                onClick={() => {
                                                                    setIsEditOpen(false);
                                                                    setVariantName('');
                                                                    setVariantPrice(0);
                                                                    setSelectedCat([]);
                                                                    setSelectedTag([]);
                                                                    setVariantIsStackMgmt(false);
                                                                    setVariantQuantity(0);
                                                                    setVariantStatus('');
                                                                    setMenuOrder(null);
                                                                    setSelectedRecords([]);
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};
export default PrivateRouter(Index);
