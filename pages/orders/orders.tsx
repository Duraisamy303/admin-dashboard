import React, { useState, useEffect } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import 'tippy.js/dist/tippy.css';
import moment from 'moment';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import CommonLoader from '../elements/commonLoader';
import { ABANDONT_CART_LIST, CREATE_DRAFT_ORDER, ORDER_LIST, PRODUCT_PREV_PAGINATION } from '@/query/product';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import { useRouter } from 'next/router';
import IconEdit from '@/components/Icon/IconEdit';
import dayjs from 'dayjs';
import { OrderStatus, PaymentStatus, addCommasToNumber, getCurrentDateTime, handleExportByChange, mintDateTime } from '@/utils/functions';
import Tippy from '@tippyjs/react';
import IconPencil from '@/components/Icon/IconPencil';
import Link from 'next/link';
import OrderQuickEdit from '@/components/orderQuickEdit';
import Modal from '@/components/Modal';
import IconLoader from '@/components/Icon/IconLoader';

const PAGE_SIZE = 20;

const AbandonedCarts = () => {
    const router = useRouter();

    const [recordsData, setRecordsData] = useState([]);
    const [startCursor, setStartCursor] = useState(null);
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [total, setTotal] = useState(0);
    const [pendingPayment, setPendingPayment] = useState(0);
    const [processing, setProcessing] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [cancelled, setCancelled] = useState(0);

    const [isOpenChannel, setIsOpenChannel] = useState(false);
    const [currencyPopup, setCurrencyPopup] = useState('');

    const [currency, setCurrency] = useState([
        {
            value: 'INR',
            label: 'INR',
        },
        {
            value: 'USD',
            label: 'USD',
        },
    ]);
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [search, setSearch] = useState('');
    const [duration, setDuration] = useState(null);
    const [interval, setInterval] = useState(null);
    const [status, setStatus] = useState(null);
    const [endDate, setEndDate] = useState('');
    const [expandedRow, setExpandedRows] = useState(null);
    const [startDate, setStartDate] = useState(getCurrentDateTime());

    const [draftOrder, { loading: draftLoading }] = useMutation(CREATE_DRAFT_ORDER);

    const filters = (search, status, duration, interval) => {
        let filterStatus = [];
        let durations = null;
        if (status !== null && status !== '') {
            filterStatus.push(status);
        }
        if (duration !== null && duration !== '') {
            durations = {
                gte: moment(interval?.gte).format('YYYY-MM-DD'),
                lte: moment(interval?.lte).format('YYYY-MM-DD'),
            };
        }

        let body = null;
        if (router.query?.customer) {
            body = { created: durations, customer: router.query?.customer, search: search };
        } else {
            body = { created: durations, search: search, status: filterStatus };
        }
        return body;
    };

    const { loading: getLoading, refetch: fetchLowStockList } = useQuery(ORDER_LIST, {
        variables: {
            first: PAGE_SIZE,
            after: null,
            sort: {
                direction: 'DESC',
                field: 'NUMBER',
            },
            filter: filters(search, status, duration, interval),
        },
        onCompleted: (data) => {
            setData(data);
        },
    });

    const {} = useQuery(ORDER_LIST, {
        variables: {
            first: PAGE_SIZE,
            after: null,
            sort: {
                direction: 'DESC',
                field: 'NUMBER',
            },
            filter: {},
        },
        onCompleted: (data) => {
            setTotal(data?.orders?.totalCount);
        },
    });

    const { refetch: orderRefetch, loading: refetchLoading } = useQuery(ORDER_LIST);

    const { refetch: orderCountRefetch } = useQuery(ORDER_LIST);

    const [fetchNextPage] = useLazyQuery(ORDER_LIST, {
        onCompleted: (data) => {
            setData(data);
        },
    });

    const [fetchPreviousPage] = useLazyQuery(ORDER_LIST, {
        onCompleted: (data) => {
            setData(data);
        },
    });

    useEffect(() => {
        getTotalCounts();
    }, []);

    const getTotalCounts = async () => {
        const filters = [
            { type: 'process', filter: { status: ['UNCONFIRMED'] } },
            { type: 'complete', filter: { status: ['FULFILLED'] } },
            { type: 'cancel', filter: { status: ['CANCELED'] } },
            { type: 'pending', filter: { paymentStatus: ['PENDING'] } },
        ];

        let totalCounts = {};

        for (let { type, filter } of filters) {
            try {
                const { data } = await orderCountRefetch({
                    channel: 'india-channel',
                    first: PAGE_SIZE,
                    after: null,
                    filter: filter,
                });

                totalCounts[type] = data?.orders?.totalCount || 0; // assuming `totalCount` exists in the response

                // Update state based on type
                switch (type) {
                    case 'pending':
                        setPendingPayment(data?.orders?.totalCount || 0);
                        break;
                    case 'process':
                        setProcessing(data?.orders?.totalCount || 0);
                        break;
                    case 'complete':
                        setCompleted(data?.orders?.totalCount || 0);
                        break;
                    case 'cancel':
                        setCancelled(data?.orders?.totalCount || 0);
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.log(`Error fetching ${type} count: `, error);
            }
        }
    };

    const handleNextPage = () => {
        fetchNextPage({
            variables: {
                first: PAGE_SIZE,
                after: endCursor,
                sort: {
                    direction: 'DESC',
                    field: 'NUMBER',
                },
                filter: filters(search, status, duration, interval),
            },
        });
    };

    const handlePreviousPage = () => {
        fetchPreviousPage({
            variables: {
                last: PAGE_SIZE,
                before: startCursor,
                sort: {
                    direction: 'DESC',
                    field: 'NUMBER',
                },
                filter: filters(search, status, duration, interval),
            },
        });
    };

    const orderNumber = (item: any) => {
        let label = '';
        if (item?.node?.user !== null && item.node.user?.firstName !== '' && item.node.user?.lastName !== '') {
            label = `#${item?.node?.number} ${item?.node?.user?.firstName} ${item?.node?.user?.lastName}`;
        } else {
            label = `#${item?.node?.number} ${item.node?.billingAddress?.firstName} ${item.node?.billingAddress?.lastName}`;
        }
        return label;
    };

    const tableFormat = (products: any) => {
        return products.map((item: any) => ({
            ...item.node,
            order: orderNumber(item),
            date: dayjs(item?.node?.created).format('MMM D, YYYY'),
            total: `${item?.node?.total.gross.currency} ${addCommasToNumber(item?.node?.total.gross.amount)}`,
            status: OrderStatus(item?.node?.status),
            paymentStatus: PaymentStatus(item?.node?.paymentStatus, item?.node?.origin, item?.node?.totalRefunded),
            invoice: item?.node?.invoices?.length > 0 ? item?.node?.invoices[0]?.number : '-',
            shipmentTracking: item?.node?.fulfillments?.length > 0 ? `${item?.node?.courierPartner?.name}\n${item?.node?.fulfillments[0]?.trackingNumber}` : '-',
            ...item,
        }));
    };

    const setData = (data: any) => {
        const products = data?.orders?.edges;
        const pageInfo = data?.orders?.pageInfo;
        setRecordsData(tableFormat(products));
        setStartCursor(pageInfo?.startCursor || null);
        setEndCursor(pageInfo?.endCursor || null);
        setHasNextPage(pageInfo?.hasNextPage || false);
        setHasPreviousPage(pageInfo?.hasPreviousPage || false);
    };

    const refresh = async () => {
        try {
            const { data } = await fetchLowStockList({
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: null,
            });
            getTotalCounts();
            setData(data);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const expandedRows = (row) => {
        setExpandedRows(row.id === expandedRow ? null : row.id);
    };

    const handleSetChannel = () => {
        setCurrencyPopup('');
        if (selectedCurrency == '') {
            setCurrencyPopup('Required this field');
        } else {
            createDraftOrder();
        }
    };

    const createDraftOrder = async () => {
        try {
            const { data } = await draftOrder({
                variables: {
                    input: {
                        channelId: selectedCurrency == 'USD' ? 'Q2hhbm5lbDox' : 'Q2hhbm5lbDoy',
                    },
                },
            });
            localStorage.setItem('channel', selectedCurrency);

            const orderId = data?.draftOrderCreate?.order?.id;
            const url = `/orders/new-order?orderId=${encodeURIComponent(orderId)}`;
            setIsOpenChannel(false);
            setSelectedCurrency('');
            setCurrencyPopup('');
            window.open(url, '_blank');
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e);
        fetchLowStockList({
            variables: {
                first: PAGE_SIZE,
                after: null,
                sort: {
                    direction: 'DESC',
                    field: 'NUMBER',
                },
                filter: filters(e, status, duration, interval),
            },
        });
    };

    const handleChangeStaus = (status) => {
        setStatus(status);
        fetchLowStockList({
            variables: {
                first: PAGE_SIZE,
                after: null,
                sort: {
                    direction: 'DESC',
                    field: 'NUMBER',
                },
                filter: filters(search, status, duration, interval),
            },
        });
    };

    const handleChangeDuration = (dates) => {
        setDuration(dates);
        if (dates !== 'custom') {
            const response = handleExportByChange(dates);
            setInterval(response);
            fetchLowStockList({
                variables: {
                    first: PAGE_SIZE,
                    after: null,
                    sort: {
                        direction: 'DESC',
                        field: 'NUMBER',
                    },
                    filter: filters(search, status, dates, response),
                },
            });
        }
    };

    const filterByDates = async (e: any) => {
        try {
            setEndDate(e);

            const response = {
                gte: startDate,
                lte: e,
            };
            setInterval(response);

            fetchLowStockList({
                variables: {
                    first: PAGE_SIZE,
                    after: null,
                    sort: {
                        direction: 'DESC',
                        field: 'NUMBER',
                    },
                    filter: filters(search, status, 'custom', response),
                },
            });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const filterStatus = (type) => {
        if (type == 'all') {
            refresh();
        } else {
            filterByStatus(type);
        }
    };

    const filterByStatus = async (type) => {
        let filter: any = {};
        if (type == 'process') {
            filter.status = ['UNCONFIRMED'];
        } else if (type == 'complete') {
            filter.status = ['FULFILLED'];
        } else if (type == 'cancel') {
            filter.status = ['CANCELED'];
        }
        if (type == 'pending') {
            filter.paymentStatus = ['PENDING'];
        }

        try {
            const { data } = await orderRefetch({
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: null,
                filter: filter,
            });

            setData(data);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const statuses = [
        { label: 'All', value: 'all', count: total },
        // { label: 'Mine', value: 'mine', count: 0 },
        // { label: 'Pending Payment', value: 'pending', count: pendingPayment },
        { label: 'Processing', value: 'process', count: processing },
        { label: 'Completed', value: 'complete', count: completed },
        { label: 'Cancelled', value: 'cancel', count: cancelled },
    ];

    return (
        <div>
            <div className="panel mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">Orders</h5>
                <div className="flex gap-3 ltr:ml-auto rtl:mr-auto">
                    <button type="button" className="btn btn-primary" onClick={() => setIsOpenChannel(true)}>
                        + Create
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => window.open('/orders/export', '_blank')}>
                        Export
                    </button>
                </div>
            </div>
            <div className="mb-4">
                {statuses.map(({ label, value, count }, index) => (
                    <span key={value} className="cursor-pointer text-blue-500 dark:text-white-light" onClick={() => filterStatus(value)}>
                        {label}
                        <span className="ml-1 cursor-pointer text-gray-500">{`(${count})`}</span>
                        {index < statuses.length - 1 && <span className="mx-2">|</span>}
                    </span>
                ))}
            </div>
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="flex space-x-3">
                    <input type="text" className="form-input w-[300px]" placeholder="Search..." value={search} onChange={(e) => handleSearchChange(e.target.value)} />
                    <div className="dropdown w-[200px]">
                        <select id="priority" className="form-select" value={status} onChange={(e) => handleChangeStaus(e.target.value)}>
                            <option value="">Status</option>
                            <option value="UNCONFIRMED">Processing</option>
                            <option value="UNFULFILLED">Fulfill</option>
                            <option value="FULFILLED">Completed</option>
                            <option value="CANCELED">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <div className="dropdown w-[200px]">
                        <select id="priority" className="form-select" value={duration} onChange={(e) => handleChangeDuration(e.target.value)}>
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

                {duration == 'custom' && (
                    <div className="flex space-x-4 pb-4">
                        <div className="col-span-4">
                            <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                Start Date:
                            </label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setEndDate(getCurrentDateTime());
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

            <div className="panel mt-6">
                {getLoading || refetchLoading ? (
                    <CommonLoader />
                ) : (
                    <div className="datatables">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={recordsData}
                            columns={[
                                {
                                    accessor: 'order',
                                    sortable: true,
                                    render: (row) => (
                                        <>
                                            <div className="">{row.order}</div>
                                            <div className="flex gap-3">
                                                <div onClick={() => expandedRows(row)} className="cursor-pointer text-blue-400 underline">
                                                    Quick Edit
                                                </div>
                                            </div>
                                        </>
                                    ),
                                },
                                { accessor: 'invoice', sortable: true, title: 'Invoice Number' },
                                { accessor: 'date', sortable: true },
                                {
                                    accessor: 'status',
                                    sortable: true,
                                    title: 'Order status',
                                    render: (row) => (
                                        <div
                                            className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                                row?.status === 'Processing'
                                                    ? 'bg-blue-200 text-blue-800'
                                                    : row?.status === 'Completed'
                                                    ? 'bg-green-200 text-green-800'
                                                    : row?.status === 'UNFULFILLED'
                                                    ? 'bg-red-200 text-red-800'
                                                    : row?.status === 'Cancelled'
                                                    ? 'bg-gray-200 text-gray-800'
                                                    : ''
                                            }`}
                                        >
                                            {row?.status}
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'paymentStatus',
                                    sortable: true,
                                    title: 'Payment status',
                                    render: (row) => (
                                        <div
                                            className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                                row?.paymentStatus === 'Processing'
                                                    ? 'bg-blue-200 text-blue-800'
                                                    : row?.paymentStatus === 'Pending'
                                                    ? 'bg-yellow-200 text-yellow-800'
                                                    : row?.paymentStatus === 'Completed'
                                                    ? 'bg-green-200 text-green-800'
                                                    : row?.paymentStatus === 'UNFULFILLED'
                                                    ? 'bg-red-200 text-red-800'
                                                    : row?.paymentStatus === 'Cancelled'
                                                    ? 'bg-gray-200 text-gray-800'
                                                    : 'bg-purple-200 text-purple-800'
                                            }`}
                                        >
                                            {row?.paymentStatus}
                                        </div>
                                    ),
                                },
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
                                    accessor: 'actions',
                                    title: 'Actions',
                                    render: (row) => (
                                        <>
                                            <Tippy content="Edit">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (row?.origin == 'CHECKOUT') {
                                                            if (row?.transactions?.length > 0) {
                                                                window.open(`/orders/editorders?id=${row.id}`, '_blank');
                                                            } else {
                                                                window.open(`/orders/editorder?id=${row.id}`, '_blank');
                                                            }
                                                        } else {
                                                            window.open(`/orders/editorder?id=${row.id}`, '_blank');
                                                        }
                                                    }}
                                                >
                                                    <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                                </button>
                                            </Tippy>
                                        </>
                                    ),
                                },
                            ]}
                            rowExpansion={{
                                collapseProps: {
                                    transitionDuration: 20,
                                    animateOpacity: false,
                                    transitionTimingFunction: 'ease-out',
                                },
                                allowMultiple: false,
                                content: ({ record, collapse }) =>
                                    expandedRow === record.id ? (
                                        <div>
                                            <OrderQuickEdit
                                                id={record?.id}
                                                updateList={() => {
                                                    refresh();
                                                }}
                                                closeExpand={() => {
                                                    setExpandedRows(null);
                                                    collapse();
                                                }}
                                            />
                                        </div>
                                    ) : null,
                            }}
                            highlightOnHover
                            totalRecords={recordsData.length}
                            recordsPerPage={PAGE_SIZE}
                            page={null}
                            onPageChange={(p) => {}} // Dummy handler for onPageChange
                            sortStatus={{
                                columnAccessor: 'name',
                                direction: 'asc',
                            }}
                            onSortStatusChange={() => {}}
                            withBorder={true}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) => ''}
                        />

                        <div className="mt-5 flex justify-end gap-3">
                            <button disabled={!hasPreviousPage} onClick={handlePreviousPage} className={`btn ${!hasPreviousPage ? 'btn-disabled' : 'btn-primary'}`}>
                                <IconArrowBackward />
                            </button>
                            <button disabled={!hasNextPage} onClick={handleNextPage} className={`btn ${!hasNextPage ? 'btn-disabled' : 'btn-primary'}`}>
                                <IconArrowForward />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Modal
                addHeader={'Select a Currency'}
                open={isOpenChannel}
                close={() => {
                    setCurrencyPopup('');
                    setIsOpenChannel(false);
                    setSelectedCurrency('');
                }}
                renderComponent={() => (
                    <div className="p-5">
                        <select
                            className="form-select"
                            value={selectedCurrency}
                            onChange={(val) => {
                                const selectedCurrency: any = val.target.value;
                                setSelectedCurrency(selectedCurrency);
                            }}
                        >
                            <option value="" disabled selected>
                                Select a currency
                            </option>
                            {currency?.map((item: any) => (
                                <option key={item?.value} value={item?.value}>
                                    {item?.label}
                                </option>
                            ))}
                        </select>
                        {currencyPopup && <div className="mt-1 text-sm text-red-400">{currencyPopup}</div>}

                        <div className="mt-8 flex items-center justify-end">
                            <button
                                type="button"
                                className="btn btn-outline-danger gap-2"
                                onClick={() => {
                                    setCurrencyPopup('');
                                    setIsOpenChannel(false);
                                    setSelectedCurrency('');
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => handleSetChannel()}>
                                {draftLoading ? <IconLoader /> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default PrivateRouter(AbandonedCarts);
