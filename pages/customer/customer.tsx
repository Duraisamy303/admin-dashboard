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
import { DELETE_PRODUCTS, CUSTOMER_ALL_LIST, DELETE_CUSTOMER } from '@/query/product';
import { Failure, showDeleteAlert } from '@/utils/functions';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import moment from 'moment';
import CommonLoader from '../elements/commonLoader';

const CustomerList = () => {
    const router = useRouter();

    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const {
        error,
        data: customerData,
        loading: getLoading,
        refetch: customerListRefetch,
    } = useQuery(CUSTOMER_ALL_LIST, {
        variables: {
            first: 1000,
            filter: {
                dateJoined: null,
                numberOfOrders: null,
            },
            sort: {
                direction: 'ASC',
                field: 'LAST_NAME',
            },
            PERMISSION_HANDLE_CHECKOUTS: true,
            PERMISSION_HANDLE_PAYMENTS: true,
            PERMISSION_HANDLE_TAXES: true,
            PERMISSION_IMPERSONATE_USER: true,
            PERMISSION_MANAGE_APPS: true,
            PERMISSION_MANAGE_CHANNELS: true,
            PERMISSION_MANAGE_CHECKOUTS: true,
            PERMISSION_MANAGE_DISCOUNTS: true,
            PERMISSION_MANAGE_GIFT_CARD: true,
            PERMISSION_MANAGE_MENUS: true,
            PERMISSION_MANAGE_OBSERVABILITY: true,
            PERMISSION_MANAGE_ORDERS: true,
            PERMISSION_MANAGE_ORDERS_IMPORT: true,
            PERMISSION_MANAGE_PAGES: true,
            PERMISSION_MANAGE_PAGE_TYPES_AND_ATTRIBUTES: true,
            PERMISSION_MANAGE_PLUGINS: true,
            PERMISSION_MANAGE_PRODUCTS: true,
            PERMISSION_MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES: true,
            PERMISSION_MANAGE_SETTINGS: true,
            PERMISSION_MANAGE_SHIPPING: true,
            PERMISSION_MANAGE_STAFF: true,
            PERMISSION_MANAGE_TAXES: true,
            PERMISSION_MANAGE_TRANSLATIONS: true,
            PERMISSION_MANAGE_USERS: true,
        },
        // variables: { channel: 'india-channel', first: 100, direction: 'DESC', field: 'CREATED_AT' }, // Pass variables here
    });

    const [customerList, setCustomerList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getCustomerList();
    }, [customerData]);

    const getCustomerList = () => {
        setLoading(true);
        if (customerData) {
            if (customerData && customerData.customers && customerData.customers?.edges?.length > 0) {
                const newData = customerData.customers?.edges?.map((item: any) => ({
                    ...item.node,
                    name: item?.node?.firstName + item?.node?.lastName,
                    email: item?.node?.email,
                    orderCount: item?.node?.orders?.totalCount,
                    dateJoined: moment(item?.node?.dateJoined).format('YYYY-MM-DD'),
                }));

                // const sorting: any = sortBy(newData, 'id');
                setCustomerList(newData);
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

    const [deleteCustomer] = useMutation(DELETE_CUSTOMER);

    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    useEffect(() => {
        // Sort finishList by 'id' and update initialRecords
        setInitialRecords(customerList);
    }, [customerList]);

    // Log initialRecords when it changes
    useEffect(() => {}, [initialRecords]);

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
            return customerList.filter((item: any) => {
                const name = item?.firstName + item?.lastName;
                return name?.toLowerCase().includes(search.toLowerCase()) || item?.email?.toLowerCase().includes(search.toLowerCase());
            });
        });
    }, [search]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(initialRecords);
    }, [sortStatus]);

    // Product table create
    const CreateProduct = () => {
        router.push('/customer/add');
    };

    const BulkDeleteProduct = async () => {
        showDeleteAlert(
            async () => {
                if (selectedRecords.length === 0) {
                    Swal.fire('Cancelled', 'Please select at least one record!', 'error');
                    return;
                }
                const records = selectedRecords?.map((item: any) => item.id);

                const { data }: any = deleteCustomer({
                    variables: {
                        ids: records,
                    },
                });

                const updatedRecordsData = recordsData.filter((dataRecord: any) => !records.includes(dataRecord.id));
                setRecordsData(updatedRecordsData);
                await customerListRefetch();

                Swal.fire('Deleted!', 'Your Customer has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Customer List is safe :)', 'error');
            }
        );
        await customerListRefetch();
    };

    const DeleteProduct = async (record: any) => {
        showDeleteAlert(
            async () => {
                const { data }: any = deleteCustomer({
                    variables: {
                        ids: [record.id],
                    },
                });

                const updatedRecordsData = recordsData.filter((dataRecord: any) => dataRecord.id !== record.id);
                setRecordsData(updatedRecordsData);
                await customerListRefetch();

                Swal.fire('Deleted!', 'Your Customer has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Product List is safe :)', 'error');
            }
        );
        await customerListRefetch();
    };

    return (
        <div>
            <div className="panel mt-6">
                <div className="mb-10 flex flex-col gap-5 lg:mb-5 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-2">
                        <h5 className="text-lg font-semibold dark:text-white-light">Customer</h5>
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

                <div className="datatables">
                    {getLoading ? (
                        <CommonLoader />
                    ) : (
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={recordsData}
                            columns={[
                                // { accessor: 'id', sortable: true },
                                {
                                    accessor: 'name',
                                    sortable: true,
                                    // render: (row) => (
                                    //     <>
                                    //         <div  >
                                    //             {row.name}
                                    //         </div>
                                    //     </>
                                    // ),
                                },

                                { accessor: 'email', sortable: true },
                                { accessor: 'dateJoined', sortable: true, title: 'Registered Date' },

                                {
                                    accessor: 'orderCount',
                                    sortable: true,
                                    render: (row) => (
                                        <>
                                            <button className=" underline" onClick={() => router.push(`/orders/orders/?customer=${row.email}`)}>
                                                {row.orderCount}
                                            </button>
                                        </>
                                    ),
                                },
                                {
                                    // Custom column for actions
                                    accessor: 'actions', // You can use any accessor name you want
                                    title: 'Actions',
                                    // Render method for custom column
                                    render: (row: any) => (
                                        <>
                                            <div className="mx-auto flex w-max items-center gap-4">
                                                <button className="flex hover:text-info" onClick={() => router.push(`/customer/edit?id=${row.id}`)}>
                                                    <IconEdit className="h-4.5 w-4.5" />
                                                </button>
                                                {/* <button
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
                                            </button> */}

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
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrivateRouter(CustomerList);
