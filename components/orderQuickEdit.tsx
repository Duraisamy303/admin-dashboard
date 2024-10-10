import React, { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import {
    CONFIRM_ORDER,
    COUNTRY_LIST,
    CREATE_DRAFT_ORDER,
    CREATE_INVOICE,
    CREATE_NOTES,
    CREATE_PAYSLIP,
    CUSTOMER_LIST,
    DELETE_LINE,
    DELETE_NOTES,
    FINALIZE_ORDER,
    FULLFILL_ORDERS,
    GET_ORDER_DETAILS,
    MARK_US_PAID,
    ORDER_DISCOUNT_UPDATE,
    ORDER_FULFILL_DATA,
    SEND_INVOICE,
    SEND_PAYLSIP,
    SHIPPING_COST_UPDATE,
    SHIPPING_LIST,
    STATES_LIST,
    UPDATE_INVOICE,
    UPDATE_INVOICE_PDF,
    UPDATE_LINE,
    UPDATE_PAYSLIP,
    UPDATE_SHIPPING_PROVIDER,
    UPDATE_TRACKING_NUMBER,
    SEND_GIFT_CART,
    DRAFT_ORDER_CANCEL,
    UNFULFILLMENT_ORDER,
} from '@/query/product';
import { Loader } from '@mantine/core';
import moment from 'moment';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@apollo/client';
import {
    Failure,
    NotesMsg,
    Success,
    addCommasToNumber,
    channels,
    formatCurrency,
    freeShipping,
    getCurrentDateTime,
    mintDateTime,
    objIsEmpty,
    profilePic,
    roundOff,
    sampleParams,
    showDeleteAlert,
    validateDateTime,
} from '@/utils/functions';
import Swal from 'sweetalert2';
import IconPencil from '@/components/Icon/IconPencil';
import IconX from '@/components/Icon/IconX';
import { Dialog, Transition } from '@headlessui/react';
import IconEdit from '@/components/Icon/IconEdit';
import Modal from '@/components/Modal';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import IconDownload from '@/components/Icon/IconDownload';
import IconLoader from '@/components/Icon/IconLoader';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import ErrorMessage from './Layouts/ErrorMessage';

const OrderQuickEdit = (props: any) => {
    const { id, closeExpand, updateList } = props;

    const router = useRouter();

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Edit Orders'));
    });

    const [addNotes] = useMutation(CREATE_NOTES);
    const [updateDiscounts] = useMutation(ORDER_DISCOUNT_UPDATE);
    const [updateFullfillStatus] = useMutation(FULLFILL_ORDERS);
    const [markAsPaid] = useMutation(MARK_US_PAID);
    const [shippingProviderUpdate, { loading: shippingLoading }] = useMutation(UPDATE_SHIPPING_PROVIDER);
    const [editTrackingNumber, { loading: trackingLoading }] = useMutation(UPDATE_TRACKING_NUMBER);
    const [confirmNewOrder] = useMutation(CONFIRM_ORDER);
    const [draftOrderCancel] = useMutation(DRAFT_ORDER_CANCEL);
    const [createInvoice] = useMutation(CREATE_INVOICE);
    const [updatesInvoice] = useMutation(UPDATE_INVOICE);
    const [updateInvoicePdf] = useMutation(UPDATE_INVOICE_PDF);
    const [unfillmentOrder] = useMutation(UNFULFILLMENT_ORDER);
    const [createPayslip] = useMutation(CREATE_PAYSLIP);
    const [updatePayslip] = useMutation(UPDATE_PAYSLIP);
    const [sendInvoice] = useMutation(SEND_INVOICE);
    const [sendPayslip] = useMutation(SEND_PAYLSIP);

    // updateFullfillStatus

    const { error, data: orderDetails, refetch: orderDetailRefetch } = useQuery(GET_ORDER_DETAILS);

    const { data: shippingProvider } = useQuery(SHIPPING_LIST, {
        variables: sampleParams,
    });

    const { data: fulfillsData, refetch: fulfillRefetch } = useQuery(ORDER_FULFILL_DATA, {
        variables: {
            orderId: id,
        },
    });

    const [orderData, setOrderData] = useState<any>({});
    const [openInvoice, setOpenInvoice] = useState(false);
    const [updateInvoideLoading, setUpdateInvoideLoading] = useState(false);

    const [transactionLoading, setTransactionLoading] = useState(false);
    const [refError, setRefError] = useState('');

    const [invoiceNumber, setInvoiceNumber] = useState('');

    const [invoiceDate, setInvoiceDate] = useState('');
    const [paySlipNameError, setPaySlipNameError] = useState('');
    const [paySlipDateError, setPaySlipDateError] = useState('');
    const [invoiceNameError, setInvoiceNameError] = useState('');
    const [invoiceDateError, setInvoiceDateError] = useState('');
    const [fullfillData, setFullfillData] = useState([]);

    const [paymentStatus, setPaymentStatus] = useState('');

    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [reference, setReference] = useState('');

    const [orderStatus, setOrderStatus] = useState('');
    const [giftCartLoading, setGiftCartLoading] = useState(false);

    const [discount, setDiscount] = useState(0);
    const [isOrderOpen, setIsOrderOpen] = useState(false);
    const [orderStatusLoading, setOrderStatusLoading] = useState(false);
    const [invoiceLoading, setInvoiceLoading] = useState(false);

    const [customerData, setCustomerData] = useState([]);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shippingPatner, setShippingPatner] = useState('');

    const [addNoteLoading, setAddNoteLoading] = useState(false);
    const [invoiceSendLoading, setInvoiceSendLoading] = useState(false);
    const [sendPayslipLoading, setSendPayslipLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [isOpenPayslip, setIsOpenPayslip] = useState(false);
    const [slipLoading, setSlipLoading] = useState(false);

    const [slipNumber, setSlipNumber] = useState('');

    const [slipDate, setSlipDate] = useState('');

    const [waitingStatus, setWaitingStatus] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);
    const [trackingError, setTrackingError] = useState(false);
    const [shippingError, setShippingError] = useState(false);
    const [isGiftCart, setIsGiftCart] = useState(false);

    useEffect(() => {
        getOrderData();
    }, [id]);

    useEffect(() => {
        getCustomer();
    }, [shippingProvider]);

    const getOrderData = async () => {
        setLoading(true);

        try {
            const { data } = await orderDetailRefetch({
                id: id,
                isStaffUser: true,
            });
            setFinalData(data);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const setFinalData = (data: any) => {
        setOrderData(data?.order);
        setOrderStatus(data?.order?.status);
        setPaymentStatus(data?.order?.paymentStatus);
        if (data?.order?.courierPartner) {
            setShippingPatner(data?.order?.courierPartner?.id);
        }

        if (data?.order?.fulfillments?.length > 0) {
            setTrackingNumber(data?.order?.fulfillments[0]?.trackingNumber);
        }

        const allGiftCards = data?.order?.lines?.every((line: any) => line?.variant?.product?.category?.name === 'Gift Card');
        setIsGiftCart(allGiftCards);

        //Payslip
        if (data?.order?.metadata?.length > 0) {
            setSlipDate(mintDateTime(data?.order?.metadata[0]?.value));
            setSlipNumber(data?.order?.metadata[1]?.value);
        }

        if (data?.order?.invoices?.length > 0) {
            setInvoiceNumber(data?.order?.invoices[0]?.number?.slice(-4));
            setInvoiceDate(mintDateTime(data?.order?.invoices[0]?.createdAt));
        }
    };

    const getCustomer = () => {
        setLoading(true);
        if (shippingProvider) {
            if (shippingProvider && shippingProvider?.shippingCarriers?.edges?.length > 0) {
                setCustomerData(shippingProvider?.shippingCarriers?.edges);
                setLoading(false);
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const onSubmit = async (record: any, { resetForm }: any) => {
        try {
            setAddNoteLoading(true);
            const data = await addNotes({
                variables: { input: { message: record.message }, orderId: id, private_note: record.mail },
            });

            const newData = { ...orderData, events: data?.data?.orderNoteAdd?.order?.events };
            setOrderData(newData);
            // getOrderDetails();
            resetForm();
            setAddNoteLoading(false);
        } catch (error) {
            setAddNoteLoading(false);

            console.log('error: ', error);
        }
    };

    const updateDiscount = async () => {
        const { data } = await updateDiscounts({
            variables: {
                discountId: orderData?.discounts[0]?.id,
                input: {
                    reason: '',
                    value: discount,
                    valueType: 'PERCENTAGE',
                },
            },
        });
    };

    const orderStateUpdate = async () => {
        try {
            setOrderStatusLoading(true);
            const isQuantity = fullfillData?.every((data: any) => data?.variant?.stocks.every((stock: any) => data?.quantity <= stock.quantity));
            if (isQuantity) {
                const modify = fullfillData?.map((item: any) => ({
                    orderLineId: item.id,
                    stocks: item?.variant?.stocks?.map((data: any) => ({
                        quantity: item?.quantity,
                        warehouse: data?.warehouse?.id,
                    })),
                }));

                const res = await updateFullfillStatus({
                    variables: {
                        input: {
                            lines: modify,
                            notifyCustomer: true,
                            allowStockToBeExceeded: false,
                        },
                        orderId: id,
                    },
                });
                if (res?.data?.orderFulfill?.errors?.length > 0) {
                    Failure(res?.data?.orderFulfill?.errors[0]?.message);
                    setIsOrderOpen(false);
                } else {
                    setOrderStatus('FULFILLED');
                    setIsOrderOpen(false);
                    // setOrderStatus(orderS);

                    Success('Order status updated');
                    updateList();
                }
                setOrderStatusLoading(false);
            } else {
                setOrderStatusLoading(false);
                Failure('Product out of stock');
            }
        } catch (error) {
            setOrderStatusLoading(false);

            // Failure(error);

            console.log('error: ', error);
        }
    };

    const updatePaymentStatus = async () => {
        try {
            if (reference == '') {
                setRefError('This field is required');
            } else {
                setTransactionLoading(true);
                const res = await markAsPaid({
                    variables: {
                        id: id,
                        transactionReference: reference,
                    },
                });
                if (res?.data?.orderMarkAsPaid?.errors?.length > 0) {
                    Failure(res?.data?.orderMarkAsPaid?.errors[0]?.message);
                    setIsPaymentOpen(false);
                    setTransactionLoading(false);
                } else {
                    getOrderData();
                    Success('Payment status updated');
                    setTransactionLoading(false);
                    updateList();
                    setRefError('');
                }
            }
        } catch (error) {
            setTransactionLoading(false);
            console.log('error: ', error);
        }
    };

    const handleSubmit = async () => {
        try {
            setUpdateLoading(true);
            if (shippingPatner == '') {
                setShippingError(true);
            } else if (trackingNumber == '') {
                setTrackingError(true);
            } else {
                updateShippingProvider();

                setUpdateLoading(false);
                setTrackingError(false);
                setShippingError(false);
            }
            setUpdateLoading(false);
        } catch (error) {
            setUpdateLoading(false);

            console.log('error: ', error);
        }
    };
    const updateShippingProvider = async () => {
        try {
            const res = await shippingProviderUpdate({
                variables: {
                    input: {
                        courierPartner: shippingPatner,
                    },
                    orderId: id,
                },
            });
            updateTrackingNumber();
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const updateTrackingNumber = async () => {
        try {
            const res = await editTrackingNumber({
                variables: {
                    id: orderDetails?.order?.fulfillments[0]?.id,
                    input: {
                        trackingNumber,
                        notifyCustomer: true,
                    },
                },
            });
            getOrderData();
            updateList();
            closeExpand();
        } catch (error) {
            setUpdateLoading(false);

            console.log('error: ', error);
        }
    };

    const handleOrderChange = async (status: any) => {
        if (orderStatus == 'UNCONFIRMED') {
            if (status == 'CANCELED') {
                orderCancelDraft();
            } else {
                Failure('Need to confirm order');
            }
        } else if (orderStatus == 'UNFULFILLED') {
            if (status == 'UNCONFIRMED') {
                Failure('Counld not change status');
            } else if (status == 'FULFILLED') {
                setIsOrderOpen(true);
                const res = await fulfillRefetch();
                setFullfillData(res?.data?.order?.lines);
            } else if (status == 'CANCELED') {
                unfillmentOrderCancel(status);
            }
        } else if (orderStatus == 'FULFILLED') {
            if (status == 'UNCONFIRMED' || status == 'UNFULFILLED') {
                Failure('Counld not change status');
            } else {
                unfillmentOrderCancel(status);
            }
        } else if (orderStatus == 'CANCELED') {
            if (status == 'UNCONFIRMED' || status == 'FULFILLED' || status == 'UNFULFILLED') {
                Failure('Counld not change status');
            }
        }
    };

    const orderCancelDraft = async () => {
        try {
            showDeleteAlert(
                async () => {
                    const res = await draftOrderCancel({
                        variables: {
                            id,
                        },
                    });
                    getOrderData();
                    updateList();
                    Swal.fire('Cancelled!', 'Are you sure to cancelled the order.', 'success');
                },

                () => {
                    Swal.fire('Cancelled', 'Your order is safe :)', 'error');
                }
            );
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const unfillmentOrderCancel = async (status: any) => {
        try {
            let fulfillId = '';
            if (orderData?.fulfillments?.length > 0) {
                fulfillId = orderData?.fulfillments[0]?.id;
                const res = await unfillmentOrder({
                    variables: {
                        id: fulfillId,
                        input: {
                            warehouseId: 'V2FyZWhvdXNlOmRmODMzODUzLTQyMGYtNGRkZi04YzQzLTVkMzdjMzI4MDRlYQ==',
                        },
                    },
                });
                orderCancelDraft();
                // setOrderStatus(status);
                updateList();
            } else {
                orderCancelDraft();
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const confirmOrder = async (country?: any) => {
        try {
            setConfirmLoading(true);
            const res = await confirmNewOrder({
                variables: {
                    id: id,
                },
            });
            getOrderData();
            setConfirmLoading(false);
            Success('Order Confirmed Successfully');
            updateList();
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const generateInvoice = async (country?: any) => {
        try {
            setInvoiceLoading(true);
            const res = await createInvoice({
                variables: {
                    orderId: id,
                },
            });
            getOrderData();
            setInvoiceLoading(false);
            updateList();
            Success('Invoice generated Successfully');
        } catch (error) {
            setInvoiceLoading(false);

            console.log('error: ', error);
        }
    };

    const updateInvoice = async (country?: any) => {
        try {
            if (invoiceNumber == '') {
                setInvoiceNameError('Please enter invoice number');
            } else if (!validateDateTime(invoiceDate)) {
                setInvoiceDateError('Please enter invoice date');
            } else {
                setUpdateInvoideLoading(true);
                const res = await updatesInvoice({
                    variables: {
                        invoiceid: orderData?.invoices[0]?.id,
                        input: {
                            number: 'PR2425' + invoiceNumber,
                            createdAt: invoiceDate,
                        },
                    },
                });

                if (res.data?.invoiceUpdate?.errors?.length > 0) {
                    setOpenInvoice(false);
                    setUpdateInvoideLoading(false);
                    Failure('Invoice not updated');
                } else {
                    const res = await updateInvoicePdf({
                        variables: {
                            invoiceId: orderData?.invoices[0]?.id,
                        },
                    });
                    setUpdateInvoideLoading(false);
                    setOpenInvoice(false);
                    getOrderData();
                    updateList();
                    Success('Invoice Updated Successfully');
                }
            }
        } catch (error) {
            setUpdateInvoideLoading(false);

            console.log('error: ', error);
        }
    };

    const generatePayslip = async (country?: any) => {
        try {
            if (slipNumber == '') {
                setPaySlipNameError('Please enter payslip number');
            } else if (!validateDateTime(slipDate)) {
                setPaySlipDateError('Please enter payslip date');
            } else {
                setSlipLoading(true);
                const res = await updatePayslip({
                    variables: {
                        id,
                        input: [
                            {
                                key: 'packing_slip_number:',
                                value: slipNumber,
                            },
                            {
                                key: 'packing_slip_date:',
                                value: slipDate,
                            },
                        ],
                        keysToDelete: [],
                    },
                });
                const response = await createPayslip({
                    variables: { orderId: id },
                });
                getOrderData();
                setSlipLoading(false);
                Success('Payslip updated Successfully');
                setPaySlipNameError('');
                setPaySlipDateError('');
                setIsOpenPayslip(false);
            }
        } catch (error) {
            setSlipLoading(false);
            console.log('error: ', error);
        }
    };

    const invoiceSend = async () => {
        try {
            setInvoiceSendLoading(true);
            const res = await sendInvoice({
                variables: {
                    id: orderData?.invoices[0]?.id,
                },
            });

            setInvoiceSendLoading(false);

            Success('Invoice sent Successfully');
        } catch (error) {
            setInvoiceSendLoading(false);

            console.log('error: ', error);
        }
    };

    const payslipSend = async () => {
        try {
            setSendPayslipLoading(true);
            const res = await sendPayslip({
                variables: {
                    orderid: id,
                },
            });

            setSendPayslipLoading(false);

            Success('Payslip sent Successfully');
        } catch (error) {
            setSendPayslipLoading(false);

            console.log('error: ', error);
        }
    };

    const stocks = (item: any) => {
        const stock = item?.quantity + item?.variant?.stocks[0]?.quantity - item?.variant?.stocks[0]?.quantityAllocated;
        if (stock > 0) {
            return stock;
        } else {
            return 'Out of stock';
        }
    };

    return (
        <>
            <h3 className="text-lg font-semibold dark:text-white-light">QUICK EDIT</h3>

            <div className="mt-3 w-[92%]">
                <div className=" col-span-9 mb-5  ">
                    <div className="panel mb-5 p-5">
                        <div className="flex justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold">{`Order ${orderData?.number} Details `}</h3>
                                {freeShipping?.includes(orderData?.shippingMethod?.id) && <h3 className="rounded-2xl bg-green-100 p-2 text-sm font-semibold text-green-700">Free Shipping</h3>}
                            </div>
                            {orderStatus == 'UNCONFIRMED' && (
                                <button type="submit" className="btn btn-outline-primary" onClick={() => confirmOrder()}>
                                    {confirmLoading ? <IconLoader /> : ' Order Confirm'}
                                </button>
                            )}
                            {/* <p className=" pt-1 text-gray-500">Payment via Cash on delivery. Customer IP: 122.178.161.16</p> */}
                        </div>
                        <div className="mt-8">
                            <h5 className="mb-3 text-lg font-semibold">General</h5>
                            <div className="grid grid-cols-12 gap-5">
                                <div className="col-span-4">
                                    <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                        Order created:
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={moment(orderData?.order?.created).format('YYYY-MM-DDTHH:mm')}
                                        id="dateTimeCreated"
                                        name="dateTimeCreated"
                                        className="form-input"
                                        disabled
                                    />
                                </div>
                                <>
                                    <div className="col-span-4">
                                        <label htmlFor="regularPrice" className="block pr-2 text-sm font-medium text-gray-700">
                                            Order Status:
                                        </label>
                                        <select
                                            //  disabled={orderStatus == 'FULFILLED'}
                                            className="form-select"
                                            value={orderStatus}
                                            onChange={(e) => handleOrderChange(e.target.value)}
                                        >
                                            <option value="UNCONFIRMED">Processing</option>
                                            <option value="UNFULFILLED">Fulfill</option>
                                            <option value="FULFILLED">Completed</option>
                                            <option value="CANCELED">Cancelled</option>
                                        </select>
                                    </div>

                                    <div className="col-span-4">
                                        <label htmlFor="regularPrice" className="block pr-2 text-sm font-medium text-gray-700">
                                            Payment Status:
                                        </label>
                                        <select
                                            disabled={paymentStatus == 'FULLY_CHARGED'}
                                            className="form-select"
                                            value={paymentStatus}
                                            onChange={(e) => {
                                                const status = e.target.value;
                                                if (status == 'FULLY_CHARGED') {
                                                    setIsPaymentOpen(true);
                                                } else {
                                                    setPaymentStatus(status);
                                                }
                                            }}
                                        >
                                            <option value="NOT_CHARGET">payment pending</option>
                                            <option value="FULLY_CHARGED">payment completed</option>
                                        </select>
                                    </div>
                                    {orderData?.paymentMethod?.name && (
                                        <div className="col-span-4">
                                            <label htmlFor="regularPrice" className="block pr-2 text-sm font-medium text-gray-700">
                                                Payment Method:
                                            </label>
                                            <input type="text" value={orderData?.paymentMethod?.name} name="paymentMenthod" className="form-input" disabled />
                                        </div>
                                    )}
                                    {orderStatus != 'UNCONFIRMED' && (
                                        <div className="col-span-8  items-center ">
                                            {orderStatus == 'FULFILLED' && (
                                                <div className="col-span-8 flex items-center  justify-between gap-4">
                                                    <div className=" w-full ">
                                                        <label htmlFor="status" className=" pr-2 text-sm font-medium text-gray-700">
                                                            Shipping Provider
                                                        </label>

                                                        <select className="form-select" value={shippingPatner} onChange={(e) => setShippingPatner(e.target.value)}>
                                                            <option value="">Choose Shipping Provider</option>
                                                            {customerData?.map((item: any) => (
                                                                <option key={item?.node?.id} value={item?.node?.id}>
                                                                    {item?.node?.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {shippingPatner == '' && shippingError && <div className=" text-danger">Required this field</div>}
                                                    </div>

                                                    <div className="w-full ">
                                                        <label htmlFor="status" className=" pr-2 text-sm font-medium text-gray-700">
                                                            Tracking Number
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className={`form-input `}
                                                            placeholder="Tracking number"
                                                            value={trackingNumber}
                                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                                        />
                                                        {trackingNumber == '' && trackingError && <div className=" text-danger">Required this field</div>}
                                                    </div>
                                                </div>
                                            )}
                                            {/* <div className="mt-5 border-t border-gray-200 pb-2 ">
                                                        <div className=" pt-3">
                                                            <button onClick={() => handleSubmit()} className="btn btn-outline-primary">
                                                                {updateLoading ? <IconLoader /> : 'Update'}
                                                            </button>
                                                        </div>
                                                    </div> */}
                                        </div>
                                    )}
                                    <div className=" col-span-4  overflow-y-auto ">
                                        <div className=" flex items-center justify-between border-b border-gray-200 pb-2 ">
                                            <h3 className="text-lg font-semibold">Payslip</h3>

                                            {orderData?.metadata?.length > 0 && (
                                                <button
                                                    type="submit"
                                                    // className="btn btn-outline-primary"
                                                    onClick={() => {
                                                        setSlipDate(mintDateTime(slipDate));
                                                        setSlipNumber(slipNumber);
                                                        setIsOpenPayslip(true);
                                                    }}
                                                >
                                                    <IconEdit />
                                                </button>
                                            )}
                                        </div>
                                        {orderData?.metadata?.length > 0 ? (
                                            <div className="pt-4">
                                                <div className="flex justify-between">
                                                    <p>Number</p>
                                                    <p>{orderData?.metadata[1]?.value}</p>
                                                </div>
                                                {orderData?.metadata[0]?.value && (
                                                    <div className="flex justify-between">
                                                        <p>Date</p>
                                                        <p>{moment(orderData?.metadata[0]?.value).format('YYYY/MM/DD')}</p>
                                                    </div>
                                                )}
                                                <div className="flex justify-between pt-3">
                                                    <button type="submit" className="btn btn-primary" onClick={() => payslipSend()}>
                                                        {sendPayslipLoading ? <IconLoader /> : 'Send'}
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="btn btn-outline-primary"
                                                        onClick={() => window.open('http://file.prade.in' + orderData?.metadata[2]?.value, '_blank')}
                                                    >
                                                        <IconDownload />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            orderStatus == 'FULFILLED' && (
                                                <div className="flex justify-end pt-5">
                                                    <button type="submit" className="btn btn-primary" onClick={() => setIsOpenPayslip(true)}>
                                                        Generate
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <div className=" col-span-4  overflow-y-auto">
                                        <div className=" flex items-center justify-between border-b border-gray-200 pb-2 ">
                                            <h3 className="text-lg font-semibold">Invoice</h3>
                                            {orderData?.invoices?.length > 0 && (
                                                <button type="submit" onClick={() => setOpenInvoice(true)}>
                                                    <IconEdit />
                                                </button>
                                            )}
                                        </div>
                                        {orderData?.invoices?.length > 0 ? (
                                            <div className="pt-4">
                                                <div className="flex justify-between">
                                                    <p>Number</p>
                                                    <p>{orderData?.invoices[0]?.number}</p>
                                                </div>
                                                <div className="flex justify-between">
                                                    <p>Date</p>
                                                    <p>{moment(orderData?.invoices[0]?.createdAt).format('YYYY/MM/DD')}</p>
                                                </div>
                                                <div className="flex justify-between pt-3">
                                                    <button type="submit" className="btn btn-primary" onClick={() => invoiceSend()}>
                                                        {invoiceSendLoading ? <IconLoader /> : 'Send'}
                                                    </button>
                                                    <button type="submit" className="btn btn-outline-primary" onClick={() => window.open(orderData?.invoices[0]?.url, '_blank')}>
                                                        <IconDownload />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            orderStatus == 'FULFILLED' && (
                                                <div className="flex justify-end pt-5">
                                                    <button type="submit" className="btn btn-primary" onClick={() => generateInvoice()}>
                                                        {invoiceLoading ? <IconLoader /> : 'Generate'}
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </>
                            </div>
                            {orderStatus == 'FULFILLED' && (
                                <div className="mt-4 flex justify-end gap-5">
                                    <button type="submit" className="btn btn-primary " onClick={() => handleSubmit()}>
                                        {shippingLoading || trackingLoading ? <IconLoader /> : 'Update'}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-danger "
                                        onClick={() => {
                                            closeExpand();
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                addHeader={'Transaction reference'}
                open={isPaymentOpen}
                close={() => setIsPaymentOpen(false)}
                renderComponent={() => (
                    <div className="p-5 pb-7">
                        <form onSubmit={updateDiscount}>
                            <div className=" w-full">
                                <input type="text" className="form-input" placeholder="Reference" value={reference} onChange={(e: any) => setReference(e.target.value)} />
                                {refError && <div className="mt-1 text-danger">{refError}</div>}
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <button type="button" className="btn btn-outline-danger gap-2" onClick={() => setIsPaymentOpen(false)}>
                                    Cancel
                                </button>
                                <button type="button" onClick={() => updatePaymentStatus()} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                    {transactionLoading ? <IconLoader /> : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            />
            <Modal
                addHeader={'Update Payslip'}
                open={isOpenPayslip}
                close={() => {
                    setPaySlipNameError('');
                    setPaySlipDateError('');
                    setIsOpenPayslip(false);
                    getOrderData();
                }}
                renderComponent={() => (
                    <div className="p-5 pb-7">
                        <form className="flex flex-col gap-3">
                            <div className=" w-full">
                                <input type="text" className="form-input" placeholder="Slip Number" value={slipNumber} onChange={(e: any) => setSlipNumber(e.target.value)} />
                                <ErrorMessage message={paySlipNameError} />
                            </div>

                            <div className=" w-full">
                                <input
                                    type="datetime-local"
                                    min={getCurrentDateTime()}
                                    value={moment(slipDate).format('YYYY-MM-DDTHH:mm')}
                                    onChange={(e) => setSlipDate(e.target.value)}
                                    id="dateTimeCreated"
                                    name="dateTimeCreated"
                                    className="form-input"
                                />
                                <ErrorMessage message={paySlipDateError} />
                                {/* <input type="text" className="form-input" placeholder="Slip Date" value={slipDate} onChange={(e: any) => slipDate(e.target.value)} /> */}
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger gap-2"
                                    onClick={() => {
                                        setPaySlipNameError('');
                                        setPaySlipDateError('');
                                        setIsOpenPayslip(false);
                                        getOrderData();
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="button" onClick={() => generatePayslip()} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                    {slipLoading ? <IconLoader /> : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            />

            <Modal
                addHeader={'Update Invoice'}
                open={openInvoice}
                close={() => {
                    setInvoiceDateError('');
                    setInvoiceNameError('');
                    getOrderData();
                    setOpenInvoice(false);
                }}
                renderComponent={() => (
                    <div className="p-5 pb-7">
                        <form onSubmit={updateDiscount}>
                            <div className="w-full flex-col ">
                                <div className="flex gap-3">
                                    <div className="w-[30%]">
                                        <input type="text" disabled className="form-input" placeholder="Reference" value={'PR2425'} />
                                    </div>
                                    <div className="w-[70%]">
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Invoice number"
                                            value={invoiceNumber}
                                            maxLength={4}
                                            onChange={(e: any) => {
                                                const inputValue = e.target.value;
                                                setInvoiceNumber(inputValue);
                                            }}
                                        />
                                        <ErrorMessage message={invoiceNameError} />
                                    </div>
                                </div>
                                <div className="pt-5">
                                    <input
                                        type="datetime-local"
                                        min={mintDateTime(slipDate) || getCurrentDateTime()}
                                        max={getCurrentDateTime()}
                                        value={moment(invoiceDate).format('YYYY-MM-DDTHH:mm')}
                                        onChange={(e) => setInvoiceDate(e.target.value)}
                                        id="dateTimeCreated"
                                        name="dateTimeCreated"
                                        className="form-input"
                                    />
                                    <ErrorMessage message={invoiceDateError} />
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger gap-2"
                                    onClick={() => {
                                        setInvoiceDateError('');
                                        setInvoiceNameError('');
                                        getOrderData();
                                        setOpenInvoice(false);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="button" onClick={() => updateInvoice()} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                    {updateInvoideLoading ? <IconLoader /> : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            />
            <Modal
                edit={isOrderOpen}
                addHeader={'Shipments'}
                open={isOrderOpen}
                close={() => setIsOrderOpen(false)}
                renderComponent={() => (
                    <>
                        <div className="overflow-scroll p-5">
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="w-1">Product</th>
                                            <th className="w-1">Image</th>

                                            <th className="w-1">Sku</th>
                                            <th className="w-1">Qty</th>
                                            <th className="w-1">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fullfillData?.length > 0 &&
                                            fullfillData?.map((item: any, index) => (
                                                <tr className="panel align-top" key={index}>
                                                    <td>{item?.productName}</td>
                                                    <td>
                                                        <img src={profilePic(item?.variant?.product?.thumbnail?.url)} height={80} alt="Selected" className="object-cover" />
                                                    </td>
                                                    <td>{item?.variant?.sku}</td>

                                                    <td>
                                                        <div>{item?.quantity}</div>
                                                    </td>
                                                    <td>
                                                        <div>{stocks(item)}</div>
                                                    </td>
                                                    {/* <td>
                                                        <div>{item?.totalPrice?.gross?.amount}</div>
                                                    </td> */}
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end gap-5 pt-4">
                                <button
                                    onClick={() => {
                                        setIsOrderOpen(false);
                                    }}
                                    className="rounded border border-black bg-transparent px-4 py-2 font-semibold text-black hover:border-transparent hover:bg-blue-500 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    // disabled={!isFullfiled()}
                                    onClick={() => orderStateUpdate()}
                                    className="rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-500 hover:border-transparent hover:bg-blue-500 hover:text-white"
                                >
                                    {orderStatusLoading ? <IconLoader /> : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            />
        </>
    );
};

export default PrivateRouter(OrderQuickEdit);
