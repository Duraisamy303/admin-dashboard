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
    Failure,
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
import OrderQuickEdit from '@/components/orderQuickEdit';

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

    const { data: finishData, refetch: orderRefetch, loading: getLoading } = useQuery(EXPORT_LIST);

    const [finishList, setFinishList] = useState([]);
    const [allData, setAllData] = useState([]);

    const [loading, setLoading] = useState(false);
    const [currencyLoading, setCurrencyLoading] = useState(false);

    const [exportBy, setExportBy] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startDate, setStartDate] = useState(getCurrentDateTime());
    const [expandedRow, setExpandedRows] = useState(getCurrentDateTime());

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

    const { data: ExportList, refetch: exportListeRefetch, loading: exportLoading } = useQuery(EXPORT_LIST);

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
            first: 500,
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
            date: dayjs(item?.node?.created).format('MMM D, YYYY'),
            total: `${item?.node?.total.gross.currency} ${addCommasToNumber(item?.node?.total.gross.amount)}`,
            status: OrderStatus(item?.node?.status),
            paymentStatus: PaymentStatus(item?.node?.paymentStatus,item?.node?.origin, item?.node?.totalRefunded),
            invoice: item?.node?.invoices?.length > 0 ? item?.node?.invoices[0]?.number : '-',
            shipmentTracking: item?.node?.fulfillments?.length > 0 ? `${item?.node?.courierPartner?.name}\n${item?.node?.fulfillments[0]?.trackingNumber}` : '-',
            ...item,
            // shipmentTracking:item?.node?.fulfillments?.length>0 ?{`${item?.node?.courierPartner?.name} ${"\n"} ${item?.node?.courierPartner?.trackingUrl}${item?.node?.fulfillments[0]?.trackingNumber}`}:"-"
        }));

        setFinishList(newData);
        setAllData(res);
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

    const aefwev = () => {
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

    const excelDownload = async () => {
        try {
            setState({ loading: true });
            let hasNextPage = true;
            let after = null;
            let allData = [];
            let response = null;
            while (hasNextPage) {
                if (exportBy == 'custom') {
                    response = {
                        gte: startDate,
                        lte: endDate,
                    };
                } else {
                    response = handleExportByChange(exportBy);
                }

                let durations = null;
                if (exportBy != '') {
                    durations = {
                        gte: moment(response?.gte).format('YYYY-MM-DD'),
                        lte: moment(response?.lte).format('YYYY-MM-DD'),
                    };
                }
                const res = await exportListeRefetch({
                    first: 200,
                    after: after,
                    sort: {
                        direction: 'DESC',
                        field: 'NUMBER',
                    },
                    filter: {
                        created: durations,
                    },
                });

                const edges = res?.data?.orders?.edges;
                const pageInfo = res?.data?.orders?.pageInfo;

                if (!pageInfo || !edges) {
                    console.error('Invalid response structure:', res);
                    setState({ loading: false });

                    throw new Error('Invalid response structure');
                }

                allData = [...allData, ...edges];
                after = pageInfo.endCursor;
                hasNextPage = pageInfo.hasNextPage;
            }
            setState({ loading: false });

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
                    ProductSKU: data?.lines?.map((data: any) => data?.productSku).join(','),
                    ProductPrice: data?.lines?.map((data: any) => `${data?.totalPrice?.gross?.currency} ${addCommasToNumber(data?.totalPrice?.gross?.amount)}`).join(','),
                    DateOfPurchase: moment(data?.updatedAt).format('YYYY-MM-DD'),
                    PaymentStatus: data?.paymentStatus,
                    Currency: data?.total?.gross?.currency,
                    Shipping: `${data?.shippingPrice?.gross?.currency} ${addCommasToNumber(data?.shippingPrice?.gross?.amount)}`,
                    Discount: data?.discounts?.length > 0 ? `${data?.discounts[0]?.amount?.currency} ${addCommasToNumber(data?.discounts[0]?.amount?.amount)}` : 0,
                    PurchaseTotal: `${data?.total?.gross?.currency} ${addCommasToNumber(data?.total?.gross?.amount)}`,
                    Refund: `${data?.totalRefunded?.currency} ${addCommasToNumber(data?.totalRefunded?.amount)}`,
                    GST: `${data?.total?.tax?.currency} ${addCommasToNumber(data?.total?.tax?.amount)}`,
                };

                return res;
            });

            if (excelData?.length > 0) {
                downloadExlcel(excelData, 'Export Orders');
            } else {
                Failure('No Data Found');
            }
        } catch (error) {
            setState({ loading: false });

            console.error('Error:', error);
        }
    };

    return (
        <div>
            <div>
                <div className="panel mb-5 flex items-center justify-between gap-3 p-5 ">
                    <h3 className="text-lg font-semibold dark:text-white-light">Export Orders</h3>
                </div>
                <div className=" flex w-full items-center justify-center text-center">
                    <div className="panel w-full p-4 text-center">
                        <h3 className="text-lg font-semibold dark:text-white-light ">Export orders to a CSV file</h3>
                        <div className="active mt-4 flex items-center justify-center">
                            <div className="mb-5 mr-4 pr-6">
                                <label htmlFor="upsells" className="block pr-5 text-sm font-medium text-gray-700">
                                    Filter by duration ?
                                </label>
                            </div>
                            <div className="mb-5">
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
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-5">
                            <div className="mb-5">
                                {state.loading ? (
                                    <button type="button" className="btn btn-primary ">
                                        <IconLoader className="inline-block shrink-0 animate-[spin_2s_linear_infinite] align-middle ltr:mr-2 rtl:ml-2" />
                                        Loading
                                    </button>
                                ) : (
                                    <button type="button" className="btn btn-primary " onClick={excelDownload}>
                                        Generate CSV
                                    </button>
                                )}
                            </div>
                            <div className="mb-5">
                                <button type="button" className="btn btn-primary " onClick={() => router.push('/orders/orders')}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivateRouter(Orders);
