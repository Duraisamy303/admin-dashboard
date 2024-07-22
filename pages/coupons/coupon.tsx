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
import { useQuery } from '@apollo/client';
import { PRODUCT_LIST } from '@/query/product';
import moment from 'moment';

const ProductList = () => {
    const router = useRouter();
    const isRtl = useSelector((state:any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const { error, data: productData } = useQuery(PRODUCT_LIST, {
        variables: { channel: 'india-channel', first: 100 }, // Pass variables here
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
                    categories: item?.node?.category?.name,
                    date: moment(item?.node?.created).format('DD-MM-YYYY'),
                    price: item?.node?.pricing?.priceRange?.start?.gross?.amount,
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
        dispatch(setPageTitle('Checkbox Table'));
    });
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState([]);
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [filterFormData, setFilterFormData] = useState({
        category: '',
        stock: '',
        productType: '',
    });

    useEffect(() => {
        // Sort finishList by 'id' and update initialRecords
        setInitialRecords(sortBy(productList, 'id'));
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
                    item.name.toLowerCase().includes(search.toLowerCase()) ||
                    // item.sku.toLowerCase().includes(search.toLowerCase()) ||
                    // item.stock.toLowerCase().includes(search.toLowerCase()) ||
                    item.price.toString().includes(search.toLowerCase()) ||
                    // item.categories.toLowerCase().includes(search.toLowerCase()) ||
                    item.date.toString().includes(search.toLowerCase())
                );
            });
        });
    }, [search]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [sortStatus]);

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
                const updatedRecordsData = recordsData.filter((record) => !selectedRecords.includes(record));
                setRecordsData(updatedRecordsData);
                setSelectedRecords([]);
                Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Product List is safe :)', 'error');
            }
        );
    };

    const DeleteProduct = (record: any) => {
        showDeleteAlert(
            () => {
                const updatedRecordsData = recordsData.filter((dataRecord: any) => dataRecord.id !== record.id);
                setRecordsData(updatedRecordsData);
                Swal.fire('Deleted!', 'Your Product has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Product List is safe :)', 'error');
            }
        );
    };

    // top Filter Category change
    const CategoryChange = (selectedCategory: string) => {
        // Update the state with the selected category
        setFilterFormData((prevState) => ({
            ...prevState,
            category: selectedCategory,
        }));
    };

    const StockStatusChange = (selectedStockStatus: string) => {
        // Update the state with the selected stock status
        setFilterFormData((prevState) => ({
            ...prevState,
            stock: selectedStockStatus,
        }));
    };

    const productTypeChange = (selectedProductType: string) => {
        // Update the state with the selected product type
        setFilterFormData((prevState) => ({
            ...prevState,
            productType: selectedProductType,
        }));
    };

    const onFilterSubmit = (e: any) => {
        e.preventDefault();
        setFilterFormData({
            category: '',
            stock: '',
            productType: '',
        });
    };

    return (
        <div>
            <div className="panel mt-6">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Coupon</h5>

                    <div className="flex ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input mr-2 w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <div className="dropdown  mr-2 ">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="btn btn-outline-primary dropdown-toggle"
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
                        <button type="button" className="btn btn-primary" onClick={() => CreateProduct()}>
                            + Create
                        </button>
                    </div>
                </div>

                <div className="mb-5 ">
                    <form onSubmit={onFilterSubmit}>
                        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
                            <select className="form-select w-52" onChange={(e) => productTypeChange(e.target.value)}>
                                <option value="Show All Type">Show All Type</option>
                                <option value="Percentage discount">Percentage discount</option>
                            </select>
                            <button type="submit" className="btn btn-primary py-2.5">
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
                            { accessor: 'name', sortable: true },
                            // { accessor: 'sku', sortable: true },
                            // { accessor: 'stock', sortable: true },
                            { accessor: 'price', sortable: true },
                            // { accessor: 'categories', sortable: true },
                            // { accessor: 'tags', sortable: true },
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
                                            <button className="flex hover:text-info" onClick={() => router.push(`/apps/product/view?id=${row.id}`)}>
                                                {/* <Link href="/apps/product/view" className="flex hover:text-primary"> */}
                                                <IconEye />
                                            </button>

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

export default ProductList;
