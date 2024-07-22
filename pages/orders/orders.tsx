import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, Fragment, useRef } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconBell from '@/components/Icon/IconBell';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import IconPencil from '@/components/Icon/IconPencil';
import { Button, Loader } from '@mantine/core';
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
import { CREATE_DESIGN, CREATE_DRAFT_ORDER, CREATE_FINISH, DELETE_FINISH, EXPORT_LIST, FINISH_LIST, ORDER_LIST, UPDATE_DESIGN, UPDATE_FINISH } from '@/query/product';
import { useMutation, useQuery } from '@apollo/client';
import moment from 'moment';
import { useRouter } from 'next/router';
import Modal from '@/components/Modal';
import {
    OrderStatus,
    PaymentStatus,
    addCommasToNumber,
    downloadExlcel,
    formatCurrency,
    getCurrentDateTime,
    handleExportByChange,
    mintDateTime,
    objIsEmpty,
    showDeleteAlert,
    useSetState,
} from '@/utils/functions';
import dayjs from 'dayjs';
import IconLoader from '@/components/Icon/IconLoader';
import Link from 'next/link';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import CommonLoader from '../elements/commonLoader';

const Orders = () => {
    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const router = useRouter();

    const dispatch = useDispatch();

    const tableRef = useRef(null);

    const [state, setState] = useSetState({
        isOpenChannel: false,
        currency: [
            {
                value: 'INR',
                label: 'INR',
            },
            {
                value: 'USD',
                label: 'USD',
            },
        ],
        selectedCurrency: '',
    });

    const [draftOrder] = useMutation(CREATE_DRAFT_ORDER);

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState([]); // Initialize initialRecords with an empty array
    const [recordsData, setRecordsData] = useState([]);

    const { data: finishData, refetch: orderRefetch, loading: getLoading } = useQuery(ORDER_LIST);

    const [finishList, setFinishList] = useState([]);
    const [allData, setAllData] = useState([]);

    const [loading, setLoading] = useState(false);
    const [currencyLoading, setCurrencyLoading] = useState(false);

    const [exportBy, setExportBy] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startDate, setStartDate] = useState(getCurrentDateTime());

    // error message
    const [currencyPopup, setCurrencyPopup] = useState('');

    useEffect(() => {
        getOrderList();
    }, []);

    const getOrderList = async () => {
        setLoading(true);
        let body = {};

        if (router.query?.customer) {
            body = {
                first: 500,
                direction: 'DESC',
                field: 'CREATED_AT',
                filter: { created: null, customer: router.query?.customer },
            };
        } else {
            body = {
                first: 500,
                direction: 'DESC',
                field: 'CREATED_AT',
            };
        }

        const res = await orderRefetch(body);

        if (res?.data?.orders?.edges?.length > 0) {
            SetFinalDate(res?.data?.orders?.edges);
        }
        setLoading(false);
    };

    useEffect(() => {
        setInitialRecords(finishList);
    }, [finishList]);

    // Log initialRecords when it changes
    useEffect(() => {}, [initialRecords]);

    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    // const [sortStatus, setSortStatus] = useState({});

    const [modal1, setModal1] = useState(false);
    const [modalTitle, setModalTitle] = useState(null);
    const [modalContant, setModalContant] = useState<any>(null);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    // const [viewModal, setViewModal] = useState(false);

    //Mutation
    const [addOrder] = useMutation(CREATE_FINISH);
    const [updateOrder] = useMutation(UPDATE_FINISH);
    const [deleteDesign] = useMutation(DELETE_FINISH);
    const [bulkDelete] = useMutation(DELETE_FINISH);

    const { data: ExportList, refetch: exportListeRefetch } = useQuery(EXPORT_LIST);

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
            return finishList?.filter((item: any) => {
                return (
                    item?.id.toString()?.includes(search.toLowerCase()) ||
                    // item.image.toLowerCase().includes(search.toLowerCase()) ||
                    item?.order.toLowerCase()?.includes(search.toLowerCase())
                );
                // item.description.toLowerCase().includes(search.toLowerCase()) ||
                // item.slug.toLowerCase().includes(search.toLowerCase()) ||
                // item.count.toString().includes(search.toLowerCase())
            });
        });
    }, [search]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [sortStatus]);

    // FORM VALIDATION
    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required('Please fill the Name'),
        // description: Yup.string().required('Please fill the Description'),
        // slug: Yup.string().required('Please fill the Slug'),
        // count: Yup.string().required('Please fill the count'),
        // image: Yup.string().required('Please fill the Image'),
        // parentCategory: Yup.string().required('Please fill the Parent Category'),
    });

    // form submit
    const onSubmit = async (record: any, { resetForm }: any) => {
        try {
            const variables = {
                input: {
                    name: record.name,
                },
            };

            const { data } = await (modalTitle ? updateOrder({ variables: { ...variables, id: modalContant.id } }) : addOrder({ variables }));

            const newData = modalTitle ? data?.productFinishUpdate?.productFinish : data?.productFinishCreate?.productFinish;

            if (!newData) {
                console.error('Error: New data is undefined.');
                return;
            }
            const updatedId = newData.id;
            const index = recordsData.findIndex((design: any) => design && design.id === updatedId);

            const updatedDesignList: any = [...recordsData];
            if (index !== -1) {
                updatedDesignList[index] = newData;
            } else {
                updatedDesignList.push(newData);
            }

            // setFinishList(updatedDesignList);
            setRecordsData(updatedDesignList);
            const toast = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000,
            });
            toast.fire({
                icon: modalTitle ? 'success' : 'info',
                title: modalTitle ? 'Data updated successfully' : 'New data added successfully',
                padding: '10px 20px',
            });

            setModal1(false);
            resetForm();
        } catch (error) {
            console.log('error: ', error);
        }
    };

    // category table edit
    const EditOrder = (record: any) => {
        router.push(`/orders/editorder?id=${record.id}`);
    };

    const BulkDeleteOrder = async () => {
        showDeleteAlert(
            () => {
                if (selectedRecords.length === 0) {
                    Swal.fire('Cancelled', 'Please select at least one record!', 'error');
                    return;
                }
                selectedRecords?.map(async (item: any) => {
                    await bulkDelete({ variables: { id: item.id } });
                });
                const updatedRecordsData = finishList.filter((record) => !selectedRecords.includes(record));
                setFinishList(updatedRecordsData);
                setSelectedRecords([]);
                Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your List is safe :)', 'error');
            }
        );
    };

    const DeleteOrder = (record: any) => {
        showDeleteAlert(
            async () => {
                const { data } = await deleteDesign({ variables: { id: record.id } });
                const updatedRecordsData = finishList.filter((dataRecord: any) => dataRecord.id !== record.id);
                setRecordsData(updatedRecordsData);
                setFinishList(updatedRecordsData);
                // getFinishList()
                setSelectedRecords([]);
                // setFinishList(finishList)
                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Order List is safe :)', 'error');
            }
        );
    };

    // completed category delete option
    const handleSetChannel = () => {
        setCurrencyPopup('');
        if (state.selectedCurrency == '') {
            setCurrencyPopup('Required this field');
        } else {
            createDraftOrder();
        }
    };

    const createDraftOrder = async () => {
        try {
            setCurrencyLoading(true);
            const { data } = await draftOrder({
                variables: {
                    input: {
                        channelId: state.selectedCurrency == 'USD' ? 'Q2hhbm5lbDox' : 'Q2hhbm5lbDoy',
                    },
                },
            });
            localStorage.setItem('channel', state.selectedCurrency);
            setCurrencyLoading(false);
            router.push({
                pathname: '/orders/new-order',
                query: { orderId: data?.draftOrderCreate?.order?.id },
            });
        } catch (error) {
            setCurrencyLoading(false);

            console.log('error: ', error);
        }
    };

    const handleChangeDuration = async (e: any) => {
        try {
            if (e) {
                if (e == 'custom') {
                    setExportBy(e);
                } else {
                    setExportBy(e);
                    filterByDateAndYear(e);
                }
            } else {
                setExportBy(e);
                getOrderList();
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const filterByDateAndYear = async (e: any) => {
        const response = handleExportByChange(e);

        const res = await exportListeRefetch({
            first: 100,
            filter: {
                created: {
                    gte: moment(response.gte).format('YYYY-MM-DD'),
                    lte: moment(response.lte).format('YYYY-MM-DD'),
                },
                // customer: 'Durai',
                // search: '730',
            },
            sort: {
                direction: 'DESC',
                field: 'NUMBER',
            },
        });

        SetFinalDate(res?.data?.orders?.edges);
    };

    const orderNumber = (item: any) => {
        let label = '';
        if (item?.node?.user !== null) {
            label = `#${item?.node?.number} ${item?.node?.user?.firstName} ${item?.node?.user?.lastName}`;
        } else {
            label = `#${item?.node?.number} ${item.node?.billingAddress?.firstName} ${item.node?.billingAddress?.lastName}`;
        }
        return label;
    };

    const SetFinalDate = (res: any) => {
        const newData = res?.map((item: any) => ({
            ...item.node,
            order: orderNumber(item),
            date: dayjs(item?.node?.updatedAt).format('MMM D, YYYY'),
            total: `${item?.node?.total.gross.currency} ${addCommasToNumber(item?.node?.total.gross.amount)}`,
            status: OrderStatus(item?.node?.status),
            paymentStatus: PaymentStatus(item?.node?.paymentStatus),
            invoice: item?.node?.invoices?.length > 0 ? item?.node?.invoices[0]?.number : '-',
            shipmentTracking: item?.node?.fulfillments?.length > 0 ? `${item?.node?.courierPartner?.name}\n${item?.node?.fulfillments[0]?.trackingNumber}` : '-',

            // shipmentTracking:item?.node?.fulfillments?.length>0 ?{`${item?.node?.courierPartner?.name} ${"\n"} ${item?.node?.courierPartner?.trackingUrl}${item?.node?.fulfillments[0]?.trackingNumber}`}:"-"
        }));

        setFinishList(newData);
        setAllData(res);
    };

    const excelDownload = () => {
        const excelData = allData?.map((item: any) => {
            const data = item?.node;
            const res = {
                OrderNumber: orderNumber(item),
                CustomerName: ` ${data?.user?.firstName}${data?.user?.lastName}`,
                EmailID: data?.userEmail,
                PhoneNumber: data?.shippingAddress?.phone,
                Address1: data?.shippingAddress?.streetAddress1,
                Address2: data?.shippingAddress?.streetAddress2,
                Country: data?.shippingAddress?.country?.country,
                City: data?.shippingAddress?.city,
                ProductsName: data?.lines?.map((data: any) => data?.productName).join(','),
                ProductPrice: data?.lines?.map((data: any) => data?.totalPrice?.gross?.amount).join(','),
                ProductSKU: data?.lines?.map((data: any) => data?.productSku).join(','),
                DateOfPurchase: moment(data?.updatedAt).format('YYYY-MM-DD'),
                PaymentStatus: data?.paymentStatus,
                Currency: data?.total?.gross?.currency,
                PurchaseTotal: data?.total?.gross?.amount,
                Discount: 0,
                Shipping: data?.shippingPrice?.gross?.amount,
                GST: data?.total?.tax?.amount,
            };
            return res;
        });

        downloadExlcel(excelData, 'Orders');
    };

    const filterByDates = async (e: any) => {
        try {
            const res = await exportListeRefetch({
                first: 100,
                filter: {
                    created: {
                        gte: moment(startDate).format('YYYY-MM-DD'),
                        lte: moment(e).format('YYYY-MM-DD'),
                    },
                    // customer: 'Durai',
                    // search: '730',
                },
                sort: {
                    direction: 'DESC',
                    field: 'NUMBER',
                },
            });

            SetFinalDate(res?.data?.orders?.edges);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleChangeStaus = async (e: any) => {
        try {
            const status = e;
            if (status == '') {
                const res = await orderRefetch({
                    first: 500,
                    filter: {},
                    sort: {
                        direction: 'DESC',
                        field: 'NUMBER',
                    },
                });
                SetFinalDate(res?.data?.orders?.edges);
            } else {
                const res = await orderRefetch({
                    first: 500,
                    filter: {
                        created: null,
                        status: [status],
                    },
                    sort: {
                        direction: 'DESC',
                        field: 'NUMBER',
                    },
                });

                const newData = res?.data?.orders?.edges?.map((item: any) => ({
                    ...item.node,
                    order: orderNumber(item),
                    date: dayjs(item?.node?.updatedAt).format('MMM D, YYYY'),
                    total: `${formatCurrency(item?.node?.total.gross.currency)}${addCommasToNumber(item?.node?.total.gross.amount)}`,
                    status: OrderStatus(item?.node?.status),
                    paymentStatus: PaymentStatus(item?.node?.paymentStatus),
                    invoice: item?.node?.invoices?.length > 0 ? item?.node?.invoices[0]?.number : '-',
                    shipmentTracking: item?.node?.fulfillments?.length > 0 ? `${item?.node?.courierPartner?.name}\n${item?.node?.fulfillments[0]?.trackingNumber}` : '-',

                    // shipmentTracking:item?.node?.fulfillments?.length>0 ?{`${item?.node?.courierPartner?.name} ${"\n"} ${item?.node?.courierPartner?.trackingUrl}${item?.node?.fulfillments[0]?.trackingNumber}`}:"-"
                }));

                setFinishList(newData);
                setAllData(res?.data?.orders?.edges);
                SetFinalDate(res?.data?.orders?.edges);
            }
            setStatus(e);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    return (
        <div>
            <div className="panel mt-6">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Orders</h5>

                    <div className="flex ltr:ml-auto rtl:mr-auto">
                        <button type="button" className="btn btn-primary" onClick={() => setState({ isOpenChannel: true })}>
                            + Create
                        </button>
                    </div>
                </div>

                <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div className="flex">
                        <input type="text" className="form-input mr-2 w-[300px]" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />

                        <div className="dropdown  mr-2  w-[200px]">
                            <select id="priority" className="form-select" value={status} onChange={(e) => handleChangeStaus(e.target.value)}>
                                <option value="">Status</option>
                                <option value="UNCONFIRMED">Processing</option>
                                <option value="UNFULFILLED">Fulfill</option>
                                <option value="FULFILLED">Completed</option>
                                <option value="CANCELED">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex ">
                        <div className="dropdown  mr-2  w-[200px]">
                            <select id="priority" className="form-select " value={exportBy} onChange={(e) => handleChangeDuration(e.target.value)}>
                                <option value="">Select duration</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="3Months">Last 3 Months</option>
                                <option value="6Months">Last 6 Months</option>
                                <option value="year">Last year</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                        <div>
                            <button type="button" className="btn btn-primary w-[95px]" onClick={() => excelDownload()}>
                                Export
                            </button>
                        </div>
                        <div className="dropdown  ml-2 ">
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
                                        <button type="button" onClick={() => BulkDeleteOrder()}>
                                            Delete
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                </div>
                {exportBy == 'custom' && (
                    <div className="flex justify-end gap-4 pb-4">
                        <div className="col-span-4">
                            <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                Start Date:
                            </label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                }}
                                id="dateTimeCreated"
                                name="dateTimeCreated"
                                className="form-input"
                                max={getCurrentDateTime()}
                            />
                        </div>
                        <div className="col-span-4">
                            <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                End date:
                            </label>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    filterByDates(e.target.value);
                                }}
                                id="dateTimeCreated"
                                name="dateTimeCreated"
                                className="form-input"
                                max={getCurrentDateTime()}
                                min={mintDateTime(startDate || new Date())}
                            />
                        </div>
                    </div>
                )}

                <div className="datatables">
                    {getLoading ? (
                        <CommonLoader />
                    ) : (
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={initialRecords}
                            columns={[
                                // { accessor: 'id', sortable: true },
                                // { accessor: 'image', sortable: true, render: (row) => <img src={row.image} alt="Product" className="h-10 w-10 object-cover ltr:mr-2 rtl:ml-2" /> },
                                { accessor: 'order', sortable: true },
                                { accessor: 'invoice', sortable: true, title: 'Invoice Number' },

                                { accessor: 'date', sortable: true },
                                { accessor: 'status', sortable: true, title: 'Order status' },
                                { accessor: 'paymentStatus', sortable: true, title: 'Payment status' },
                                {
                                    accessor: 'shipmentTracking',
                                    sortable: true,
                                    title: 'Shipment Tracking',
                                    render: (item) => {
                                        return item?.courierPartner && item?.fulfillments?.length > 0 ? (
                                            <Link href={`${item?.courierPartner?.trackingUrl}${item?.fulfillments[0]?.trackingNumber}`.trim()} target="_blank">
                                                <div>{item?.courierPartner?.name}</div>
                                                <div>{item?.fulfillments[0]?.trackingNumber}</div>
                                            </Link>
                                        ) : (
                                            <div>-</div>
                                        );
                                    },
                                },

                                { accessor: 'total', sortable: true },
                                {
                                    // Custom column for actions
                                    accessor: 'actions', // You can use any accessor name you want
                                    title: 'Actions',
                                    // Render method for custom column
                                    render: (row: any) => (
                                        <>
                                            {/* <Tippy content="View">
                                                <button type="button" onClick={() => ViewOrder(row)}>
                                                    <IconEye className="ltr:mr-2 rtl:ml-2" />
                                                </button>
                                            </Tippy> */}
                                            <Tippy content="Edit">
                                                <button type="button" onClick={() => EditOrder(row)}>
                                                    <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                                </button>
                                            </Tippy>
                                            <Tippy content="Delete">
                                                <button type="button" onClick={() => DeleteOrder(row)}>
                                                    <IconTrashLines />
                                                </button>
                                            </Tippy>
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

            {/* CREATE AND EDIT CATEGORY FORM */}
            <Transition appear show={modal1} as={Fragment}>
                <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
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
                                <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">{modalTitle === null ? 'Create Order' : 'Edit Order'}</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal1(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="mb-5 p-5">
                                        <Formik
                                            initialValues={
                                                modalContant === null
                                                    ? { name: '' }
                                                    : {
                                                          name: modalContant?.name,
                                                          //   description: modalContant?.description,

                                                          //   count: modalContant?.count,
                                                          //   image: modalContant?.image,
                                                          //   parentCategory: modalContant?.name,
                                                      }
                                            }
                                            validationSchema={SubmittedForm}
                                            onSubmit={(values, { resetForm }) => {
                                                onSubmit(values, { resetForm }); // Call the onSubmit function with form values and resetForm method
                                            }}
                                        >
                                            {({ errors, submitCount, touched, setFieldValue, values }: any) => (
                                                <Form className="space-y-5">
                                                    {/* <div className={submitCount ? (errors.image ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="image">Image</label>
                                                        <input
                                                            id="image"
                                                            name="image"
                                                            type="file"
                                                            onChange={(event: any) => {
                                                                setFieldValue('image', event.currentTarget.files[0]);
                                                            }}
                                                            className="form-input"
                                                        />
                                                        {values.image && typeof values.image === 'string' && (
                                                            <img src={values.image} alt="Product Image" style={{ width: '30px', height: 'auto', paddingTop: '5px' }} />
                                                        )}
                                                        {submitCount ? errors.image ? <div className="mt-1 text-danger">{errors.image}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div> */}

                                                    <div className={submitCount ? (errors.name ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="fullName">Name </label>
                                                        <Field name="name" type="text" id="fullName" placeholder="Enter Name" className="form-input" />

                                                        {submitCount ? errors.name ? <div className="mt-1 text-danger">{errors.name}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div>

                                                    {/* <div className={submitCount ? (errors.description ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="description">description </label>
                                                        <Field name="description" as="textarea" id="description" placeholder="Enter Description" className="form-input" />

                                                        {submitCount ? (
                                                            errors.description ? (
                                                                <div className="mt-1 text-danger">{errors.description}</div>
                                                            ) : (
                                                                <div className="mt-1 text-success"></div>
                                                            )
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div> */}

                                                    {/* <div className={submitCount ? (errors.slug ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="slug">Slug </label>
                                                        <Field name="slug" type="text" id="slug" placeholder="Enter Description" className="form-input" />

                                                        {submitCount ? errors.slug ? <div className="mt-1 text-danger">{errors.slug}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div> */}

                                                    {/* <div className={submitCount ? (errors.count ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="count">Count</label>
                                                        <Field name="count" type="number" id="count" placeholder="Enter Count" className="form-input" />

                                                        {submitCount ? errors.count ? <div className="mt-1 text-danger">{errors.count}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div> */}

                                                    {/* <div className={submitCount ? (errors.parentCategory ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="parentCategory">Parent Category</label>
                                                        <Field as="select" name="parentCategory" className="form-select">
                                                            <option value="">Open this select menu</option>
                                                            <option value="Anklets">Anklets</option>
                                                            <option value="BlackThread">__Black Thread</option>
                                                            <option value="Kada">__Kada</option>
                                                        </Field>
                                                        {submitCount ? (
                                                            errors.parentCategory ? (
                                                                <div className=" mt-1 text-danger">{errors.parentCategory}</div>
                                                            ) : (
                                                                <div className=" mt-1 text-[#1abc9c]"></div>
                                                            )
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div> */}

                                                    <button type="submit" className="btn btn-primary !mt-6">
                                                        {modalTitle === null ? 'Submit' : 'Update'}
                                                    </button>
                                                </Form>
                                            )}
                                        </Formik>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Full View Category data*/}
            {/* <Transition appear show={viewModal} as={Fragment}>
                <Dialog as="div" open={viewModal} onClose={() => setViewModal(false)}>
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
                                <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">View Category</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setViewModal(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="mb-5 p-5"></div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition> */}

            <Modal
                addHeader={'Select a Currency'}
                open={state.isOpenChannel}
                close={() => setState({ isOpenChannel: false })}
                renderComponent={() => (
                    <div className="p-5">
                        <select
                            className="form-select"
                            value={state.selectedCurrency}
                            onChange={(val) => {
                                const selectedCurrency: any = val.target.value;
                                setState({ selectedCurrency });
                            }}
                        >
                            <option value="" disabled selected>
                                Select a currency
                            </option>
                            {state.currency?.map((item: any) => (
                                <option key={item?.value} value={item?.value}>
                                    {item?.label}
                                </option>
                            ))}
                        </select>
                        {currencyPopup && <div className="mt-1 text-sm text-red-400">{currencyPopup}</div>}

                        <div className="mt-8 flex items-center justify-end">
                            <button type="button" className="btn btn-outline-danger gap-2" onClick={() => setState({ isOpenChannel: false })}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => handleSetChannel()}>
                                {currencyLoading ? <IconLoader /> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default PrivateRouter(Orders);
