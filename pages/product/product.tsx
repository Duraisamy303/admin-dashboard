import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconBell from '@/components/Icon/IconBell';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import IconPencil from '@/components/Icon/IconPencil';
import { Button } from '@mantine/core';
import Dropdown from '../../components/Dropdown';
import IconCaretDown from '@/components/Icon/IconCaretDown';

import { Dialog, Transition } from '@headlessui/react';
import IconX from '@/components/Icon/IconX';
import Image1 from '@/public/assets/images/profile-1.jpeg';
import Image2 from '@/public/assets/images/profile-2.jpeg';
import Image3 from '@/public/assets/images/profile-3.jpeg';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import IconEye from '@/components/Icon/IconEye';
import { date } from 'yup/lib/locale';
import Link from 'next/link';
import { useRouter } from 'next/router';
import IconEdit from '@/components/Icon/IconEdit';
import { useMutation, useQuery } from '@apollo/client';
import { DELETE_PRODUCTS, PRODUCT_LIST, PARENT_CATEGORY_LIST, CATEGORY_FILTER_LIST } from '@/query/product';
import moment from 'moment';
import { Failure, formatCurrency, roundOff } from '@/utils/functions';
import PrivateRouter from '@/components/Layouts/PrivateRouter';

const ProductList = () => {
    const router = useRouter();
    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const { error, data: productData } = useQuery(PRODUCT_LIST, {
        variables: { channel: 'india-channel', first: 100, direction: 'DESC', field: 'CREATED_AT' }, // Pass variables here
    });

    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getProductList();
    }, [productData]);

    const getProductList = () => {
        setLoading(true);
        if (productData) {
            if (productData && productData.products && productData.products.edges?.length > 0) {
                const newData = productData?.products?.edges.map((item: any) => ({
                    ...item.node,
                    product: item?.node?.products?.totalCount,
                    image: item?.node?.thumbnail?.url,
                    categories: item?.node?.category?.name ? item?.node?.category?.name : '-',
                    date: item?.node?.updatedAt
                        ? `Last Modified ${moment(item?.node?.updatedAt).format('YYYY/MM/DD [at] h:mm a')}`
                        : `Published ${moment(item?.node?.channelListings[0]?.publishedAt).format('YYYY/MM/DD [at] h:mm a')}`,
                    price: `${formatCurrency('INR')}${roundOff(item?.node?.pricing?.priceRange?.start?.gross?.amount)}`,
                    status: item?.node?.channelListings[0]?.isPublished == true ? 'Published' : 'Draft',
                    sku: item?.node?.defaultVariant ? item?.node?.defaultVariant?.sku : '-',
                    tags: item?.node?.tags?.length > 0 ? item?.node?.tags?.map((item: any) => item.name)?.join(',') : '-',
                }));
                // const sorting: any = sortBy(newData, 'id');
                setProductList(newData);
                setLoading(false);

                // const newData = categoryData.categories.edges.map((item) => item.node).map((item)=>{{...item,product:isTemplateExpression.products.totalCount}});
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Products'));
    });
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState([]);
    const [recordsData, setRecordsData] = useState(initialRecords);
    const [parentLists, setParentLists] = useState([]);

    const [deleteProducts] = useMutation(DELETE_PRODUCTS);

    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [selectedCategory, setSelectedCategory] = useState('');

    const [filterFormData, setFilterFormData] = useState({
        category: '',
        stock: '',
        productType: '',
    });

    useEffect(() => {
        // Sort finishList by 'id' and update initialRecords
        setInitialRecords(productList);
    }, [productList]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return productList.filter((item: any) => {
                return (
                    // item.id.toString().includes(search.toLowerCase()) ||
                    // item.image.toLowerCase().includes(search.toLowerCase()) ||
                    item?.name?.toLowerCase().includes(search.toLowerCase()) ||
                    item?.sku?.toLowerCase().includes(search.toLowerCase()) ||
                    item?.status.toLowerCase().includes(search.toLowerCase()) ||
                    // item.stock.toLowerCase().includes(search.toLowerCase()) ||
                    // item.price.toString().includes(search.toLowerCase()) ||
                    item?.categories?.toLowerCase().includes(search.toLowerCase()) ||
                    item?.date?.toString().includes(search.toLowerCase())
                );
            });
        });
    }, [search]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [sortStatus]);

    //    parent category list query
    const {
        data: parentList,
        error: parentListError,
        refetch: parentListRefetch,
    } = useQuery(PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });
    const GetcategoryFilterData = () => {
        const getparentCategoryList = parentList?.categories?.edges;
        setParentLists(getparentCategoryList);
    };

    useEffect(() => {
        GetcategoryFilterData();
    }, [parentList]);

    const {
        data: FilterCategoryList,
        error: FilterCategoryListError,
        refetch: FilterCategoryListRefetch,
    } = useQuery(CATEGORY_FILTER_LIST, {
        variables: { channel: 'india-channel', first: 100, categoryId: selectedCategory },
    });

    const CategoryFilterList = () => {
        // const getFilterCategoryList = FilterCategoryList?.products?.edges;
        // console.log('✌️getFilterCategoryList --->', getFilterCategoryList);
        // setRecordsData(getFilterCategoryList);

        setLoading(true);

        if (FilterCategoryList) {
            if (FilterCategoryList && FilterCategoryList.products && FilterCategoryList.products.edges?.length > 0) {
                const newData = FilterCategoryList?.products?.edges.map((item: any) => ({
                    ...item.node,
                    product: item?.node?.products?.totalCount,
                    image: item?.node?.thumbnail?.url,
                    categories: item?.node?.category?.name ? item?.node?.category?.name : '-',
                    date: item?.node?.updatedAt
                        ? `Last Modified ${moment(item?.node?.updatedAt).format('YYYY/MM/DD [at] h:mm a')}`
                        : `Published ${moment(item?.node?.channelListings[0]?.publishedAt).format('YYYY/MM/DD [at] h:mm a')}`,
                    // price: item?.node?.pricing?.priceRange?.start?.gross?.amount,
                    price: `${formatCurrency('INR')}${roundOff(item?.node?.pricing?.priceRange?.start?.gross?.amount)}`,
                    status: item?.node?.channelListings[0]?.isPublished == true ? 'Published' : 'Draft',
                    sku: item?.node?.defaultVariant ? item?.node?.defaultVariant?.sku : '-',
                    tags: item?.node?.tags?.length > 0 ? item?.node?.tags?.map((item: any) => item.name)?.join(',') : '-',
                    // shipmentTracking: item?.node?.shipments?.length>0?item
                }));

                // const sorting: any = sortBy(newData, 'id');
                setProductList(newData);
                setLoading(false);

                // const newData = categoryData.categories.edges.map((item) => item.node).map((item)=>{{...item,product:isTemplateExpression.products.totalCount}});
            } else if (FilterCategoryList && FilterCategoryList.products && FilterCategoryList.products.edges?.length === 0) {
                setProductList([]);
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const onFilterSubmit = async (e: any) => {
        e.preventDefault();
        if (selectedCategory !== '') {
            await FilterCategoryListRefetch();
            CategoryFilterList();
        } else {
            getProductList();
        }

    };

    // form submit
    const onSubmit = (record: any, { resetForm }: any) => {

        const toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
        });
        toast.fire({
            icon: 'success',
            title: 'Form submitted successfully',
            padding: '10px 20px',
        });
        resetForm();
    };

    // Product table create
    const CreateProduct = () => {
        router.push('/apps/product/add');
    };

    // delete Alert Message
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
                Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your List is safe :)', 'error');
            }
        );
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
                Swal.fire('Deleted!', 'Your Product has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your List is safe :)', 'error');
            }
        );
    };

    // top Filter Category change
    const CategoryChange = (selectedCategory: string) => {
        // Update the state with the selected category
        setSelectedCategory(selectedCategory);
        // setFilterFormData((prevState) => ({
        //     ...prevState,
        //     category: selectedCategory,
        // }));
    };

    const StockStatusChange = (selectedStockStatus: string) => {
        // Update the state with the selected stock status
        // setFilterFormData((prevState) => ({
        //     ...prevState,
        //     stock: selectedStockStatus,
        // }));
    };

    const productTypeChange = (selectedProductType: string) => {
        // Update the state with the selected product type
        setFilterFormData((prevState) => ({
            ...prevState,
            productType: selectedProductType,
        }));
    };

    return (
        <div>
            <div className="panel mt-6">
                <div className="mb-10 flex flex-col gap-5 lg:mb-5 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-2">
                        <h5 className="text-lg font-semibold dark:text-white-light">Product</h5>
                        {/* <button type="button" className="btn btn-outline-primary">
                            Import
                        </button>
                        <button type="button" className="btn btn-outline-primary">
                            Export
                        </button> */}
                    </div>
                    <div className="mt-5 md:mt-0 md:flex  md:ltr:ml-auto md:rtl:mr-auto">
                        <input type="text" className="form-input  mb-3 mr-2 w-full md:mb-0 md:w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <div className="dropdown mb-3 mr-0  md:mb-0 md:mr-2">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
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
                        <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => CreateProduct()}>
                            + Create
                        </button>
                    </div>
                </div>

                <div className="mb-5 ">
                    <form onSubmit={onFilterSubmit}>
                        <div className="col-4 mx-auto  flex items-center gap-4 md:flex-row">
                            <select className="form-select flex-1" onChange={(e) => CategoryChange(e.target.value)}>
                                <option value="">Select a Categories </option>
                                {parentLists?.map((item: any) => {
                                    return (
                                        <>
                                            <option value={item?.node?.id}>{item.node?.name}</option>
                                            {item?.node?.children?.edges.map((child: any) => (
                                                <option key={child.id} value={child.node?.id} style={{ paddingLeft: '20px' }}>
                                                    -- {child.node?.name}
                                                </option>
                                            ))}
                                        </>
                                    );
                                })}
                            </select>

                            {/* New select dropdown for stock status */}
                            {/* <select className="form-select flex-1" onChange={(e) => StockStatusChange(e.target.value)}>
                                <option value="">Filter By Stock Status</option>
                                <option value="In Stock">In Stock</option>
                                <option value="Out Of Stock">Out Of Stock</option>
                            </select>

                            <select className="form-select flex-1" onChange={(e) => productTypeChange(e.target.value)}>
                                <option value="sample-product">Simple Product</option>
                                <option value="variable-product">Variable Product</option>
                            </select> */}
                            <button type="submit" className="btn btn-primary w-full py-2.5 md:w-auto">
                                Filter
                            </button>
                        </div>
                    </form>
                </div>

                <div className="datatables">
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={recordsData}
                        columns={[
                            // { accessor: 'id', sortable: true },
                            { accessor: 'image', sortable: true, render: (row) => <img src={row.image} alt="Product" className="h-10 w-10 object-cover ltr:mr-2 rtl:ml-2" /> },
                            {
                                accessor: 'name',
                                sortable: true,
                                render: (row) => (
                                    <>
                                        <div className="">{row.name}</div>
                                        <div className="">{row.name}</div>
                                    </>
                                ),
                            },

                            { accessor: 'sku', sortable: true },
                            { accessor: 'status', sortable: true },
                            { accessor: 'price', sortable: true },
                            { accessor: 'categories', sortable: true },
                            // { accessor: 'tags', sortable: true ,cellsStyle:{width:"100%",flexWrap:"wrap"}},
                            { accessor: 'date', sortable: true },
                            {
                                // Custom column for actions
                                accessor: 'actions', // You can use any accessor name you want
                                title: 'Actions',
                                // Render method for custom column
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
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        selectedRecords={selectedRecords}
                        onSelectedRecordsChange={(selectedRecords) => {
                            setSelectedRecords(selectedRecords);
                        }}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
        </div>
    );
};

export default PrivateRouter(ProductList);
