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
    REFUND_DATA,
    ORDER_FULLFILMENT_REFUND,
} from '@/query/product';
import { Loader } from '@mantine/core';
import moment from 'moment';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@apollo/client';
import {
    DraftFullfillQuantity,
    DraftQuantity,
    Failure,
    FullfillQuantity,
    NotesMsg,
    Quantity,
    Success,
    addCommasToNumber,
    channels,
    formatCurrency,
    freeShipping,
    getCurrentDateTime,
    isEmptyObject,
    mintDateTime,
    objIsEmpty,
    profilePic,
    roundOff,
    sampleParams,
    showDeleteAlert,
    updateOrderLinesWithRefund,
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
import ErrorMessage from '@/components/Layouts/ErrorMessage';

const Editorder = () => {
    const router = useRouter();
    const { id } = router.query;

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Edit Orders'));
    });

    const initialValues = {
        billing: {
            firstName: '',
            lastName: '',
            company: '',
            address_1: '',
            // address_2: '',
            city: '',
            state: '',
            country: '',
            email: '',
            phone: '',
            paymentMethod: '',
            transactionId: '',
            countryArea: '',
            pincode: '',
        },
        shipping: {
            firstName: '',
            lastName: '',
            company: '',
            address_1: '',
            // address_2: '',
            city: '',
            state: '',
            country: '',
            email: '',
            phone: '',
            paymentMethod: '',
            transactionId: '',
            countryArea: '',
            pincode: '',
        },
    };

    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState<any>({});

    const [addNotes] = useMutation(CREATE_NOTES);
    const [deleteNotes] = useMutation(DELETE_NOTES);
    const [updateDiscounts] = useMutation(ORDER_DISCOUNT_UPDATE);
    const [updateShippingCost] = useMutation(SHIPPING_COST_UPDATE);
    const [deleteLine] = useMutation(DELETE_LINE);
    const [updateFullfillStatus] = useMutation(FULLFILL_ORDERS);
    const [markAsPaid] = useMutation(MARK_US_PAID);
    const [updateLine] = useMutation(UPDATE_LINE);
    const [draftOrder] = useMutation(CREATE_DRAFT_ORDER);
    const [shippingProviderUpdate] = useMutation(UPDATE_SHIPPING_PROVIDER);
    const [editTrackingNumber] = useMutation(UPDATE_TRACKING_NUMBER);
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
    const [sendGiftCart] = useMutation(SEND_GIFT_CART);
    const [orderFullfilmentRefund, { loading: refundLoading }] = useMutation(ORDER_FULLFILMENT_REFUND);

    // updateFullfillStatus

    const {
        error,
        data: orderDetails,
        refetch: getOrderDetails,
    } = useQuery(GET_ORDER_DETAILS, {
        variables: {
            id: id,
            isStaffUser: true,
        },
    });

    const { refetch: refundDataRefetch } = useQuery(REFUND_DATA);

    const [lines, setLines] = useState([]);
    const [isGiftWrap, setIsGiftWrap] = useState([]);

    const refundAmtType = ['Automatic Amount', 'Manual Amount'];

    const { data: countryData } = useQuery(COUNTRY_LIST);

    const { data: shippingProvider } = useQuery(SHIPPING_LIST, {
        variables: sampleParams,
    });

    const { data: fulfillsData, refetch: fulfillRefetch } = useQuery(ORDER_FULFILL_DATA, {
        variables: {
            orderId: id,
        },
    });

    const [orderData, setOrderData] = useState<any>({});
    const [discountOpen, setDiscountOpen] = useState(false);
    const [openInvoice, setOpenInvoice] = useState(false);
    const [updateInvoideLoading, setUpdateInvoideLoading] = useState(false);

    const [transactionLoading, setTransactionLoading] = useState(false);
    const [refError, setRefError] = useState('');

    const [isUpdateQty, setIsUpdateQty] = useState(false);
    const [productQuantity, setProductQuantity] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');

    const [invoiceDate, setInvoiceDate] = useState('');

    const [isEdited, setIsEdited] = useState<any>({});
    const [fullfillData, setFullfillData] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [applyAllProduct, setApplyAllProduct] = useState(false);

    const [paymentStatus, setPaymentStatus] = useState('');
    const [refundStatus, setRefundStatus] = useState('');

    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [currencyPopup, setCurrencyPopup] = useState('');
    const [currencyLoading, setCurrencyLoading] = useState(false);

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

    const [isOpenChannel, setIsOpenChannel] = useState(false);
    const [addNoteLoading, setAddNoteLoading] = useState(false);
    const [invoiceSendLoading, setInvoiceSendLoading] = useState(false);
    const [sendPayslipLoading, setSendPayslipLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(refundAmtType[0]);
    const [manualAmount, setManualAmount] = useState(null);
    const [manualAmtError, setManualAmtError] = useState(null);
    const [maxRefundAmt, setMaxRefundAmt] = useState(null);

    //CountryList
    const [countryList, setCountryList] = useState([]);

    const { data: stateData } = useQuery(STATES_LIST, {
        variables: { code: formData.billing.country },
    });

    const [stateList, setStateList] = useState([]);

    const [loading, setLoading] = useState(false);
    const [refundData, setRefundData] = useState(null);
    const [refundProduct, setRefundProduct] = useState(null);
    const [alreadyRefundProduct, setAlreadyRefundProduct] = useState([]);
    const [disableLines, setDisableLines] = useState(false);
    const [initialQuantity, setInitialQuantity] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [isOpenPayslip, setIsOpenPayslip] = useState(false);
    const [slipLoading, setSlipLoading] = useState(false);

    const [slipNumber, setSlipNumber] = useState('');
    const [slipNumberError, setSlipNumberError] = useState('');
    const [slipDateError, setSlipDateError] = useState('');

    const [coupenAmt, setCoupenAmt] = useState(null);

    const [slipDate, setSlipDate] = useState('');
    //For shipping
    const [shippingOpen, setShippingOpen] = useState(false);
    const [shippingPrice, setShippingPrice] = useState(0);
    const [showBillingInputs, setShowBillingInputs] = useState(false);
    const [showShippingInputs, setShowShippingInputs] = useState(false);
    const [waitingStatus, setWaitingStatus] = useState('');
    const [notesList, setNotesList] = useState([]);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [isOpenRefund, setIsOpenRefund] = useState(false);
    const [showRefundButton, setShowRefundBtn] = useState(false);
    const [trackingError, setTrackingError] = useState(false);
    const [shippingError, setShippingError] = useState(false);
    const [isGiftCart, setIsGiftCart] = useState(false);
    const [totalAmount, setTotalAmount] = useState(null);

    useEffect(() => {
        getOrderData();
    }, [orderDetails]);

    // useEffect(() => {
    //     getRefundData();
    // }, [id]);

    useEffect(() => {
        getCustomer();
    }, [shippingProvider]);

    useEffect(() => {
        getCountryList();
    }, [countryData]);

    useEffect(() => {
        if (formData.billing.country) {
            setStateList(stateData?.addressValidationRules?.countryAreaChoices);
        }
    }, [stateData]);

    const getOrderData = () => {
        setLoading(true);
        if (orderDetails) {
            if (orderDetails && orderDetails?.order) {
                //Invoice
                getRefundData();

                if (orderDetails?.order?.invoices?.length > 0) {
                    setInvoiceNumber(orderDetails?.order?.invoices[0]?.number?.slice(-4));
                    setInvoiceDate(mintDateTime(orderDetails?.order?.invoices[0]?.createdAt));
                }

                setOrderData(orderDetails?.order);
                const allGiftCards = orderDetails?.order?.lines?.every((line: any) => line?.variant?.product?.category?.name === 'Gift Card');
                setIsGiftCart(allGiftCards);

                //coupen code

                const coupenData = orderDetails?.order?.giftCards;
                if (coupenData?.length > 0) {
                    const coupenValue = sumOldCurrentBalance(coupenData);
                    setCoupenAmt(coupenValue[0]);
                }

                //Payslip
                if (orderDetails?.order?.metadata?.length > 0) {
                    setSlipDate(mintDateTime(orderDetails?.order?.metadata[0]?.value));
                    setSlipNumber(orderDetails?.order?.metadata[1]?.value);
                }
                // {
                //     orderDetails?.order?.metadata?.length > 0 && setSlipDate(mintDateTime(orderDetails?.order?.metadata[0]?.value));
                //     setSlipNumber(orderDetails?.order?.metadata[1]?.value);
                // }

                //Status
                const filteredArray = orderDetails?.order?.events?.filter(
                    (item: any) =>
                        item.type === 'CONFIRMED' ||
                        item.type === 'FULFILLMENT_FULFILLED_ITEMS' ||
                        item.type === 'NOTE_ADDED' ||
                        item.type === 'ORDER_MARKED_AS_PAID' ||
                        item.type === 'PAYMENT_REFUNDED' ||
                        item.type === 'FULFILLMENT_REFUNDED'
                );

                const result = filteredArray?.map((item: any) => {
                    const secondItem: any = NotesMsg.find((i) => i.type === item.type);
                    return {
                        type: item.type,
                        message: item.type === 'NOTE_ADDED' ? item.message : secondItem?.message,
                        id: item.id,
                        date: item.date,
                    };
                });
                if (orderDetails?.order?.courierPartner) {
                    setShippingPatner(orderDetails?.order?.courierPartner?.id);
                }

                if (orderDetails?.order?.fulfillments?.length > 0) {
                    setTrackingNumber(orderDetails?.order?.fulfillments[0]?.trackingNumber);
                }

                setNotesList(result);
                setLines(orderDetails?.order?.lines);
                setIsGiftWrap(orderDetails?.order?.isGiftWrap);
                setLoading(false);
                setOrderStatus(orderDetails?.order?.status);
                showRefundBtn(orderDetails?.order);
                if (orderDetails?.order?.paymentStatus == 'FULLY_CHARGED' || orderDetails?.order?.paymentStatus == 'NOT_CHARGED') {
                    setPaymentStatus(orderDetails?.order?.paymentStatus);
                } else {
                    setPaymentStatus(orderDetails?.order?.paymentStatus == 'PARTIALLY_REFUNDED' ? 'FULLY_CHARGED' : orderDetails?.order?.paymentStatus);
                    setRefundStatus(orderDetails?.order?.paymentStatus);
                }
                const billing = orderDetails?.order?.billingAddress;
                const shipping = orderDetails?.order?.shippingAddress;
                if (orderDetails?.order?.discounts?.length > 0) {
                    setDiscount(orderDetails?.order?.discounts[0]?.amount?.amount);
                } else {
                    setDiscount(0);
                }

                setShippingPrice(orderDetails?.order?.shippingPrice?.gross?.amount);
                const sampleBillingData = {
                    firstName: billing?.firstName,
                    lastName: billing?.lastName,
                    company: billing?.companyName,
                    address_1: billing?.streetAddress1,
                    // address_2: billing?.streetAddress2,
                    city: billing?.city,
                    state: billing?.countryArea,
                    country: billing?.country.code,
                    email: billing?.email,
                    phone: billing?.phone,
                    paymentMethod: '',
                    transactionId: '',
                    countryArea: billing?.country?.country,
                    pincode: billing?.postalCode,
                };

                // Sample data for shipping
                const sampleShippingData = {
                    firstName: shipping?.firstName,
                    lastName: shipping?.lastName,
                    company: shipping?.companyName,
                    address_1: shipping?.streetAddress1,
                    // address_2: shipping?.streetAddress2,
                    city: shipping?.city,
                    state: shipping?.countryArea,
                    country: shipping?.country.code,
                    email: shipping?.email,
                    phone: shipping?.phone,
                    paymentMethod: '',
                    transactionId: '',
                    countryArea: shipping?.country?.country,
                    pincode: shipping?.postalCode,
                };

                // Update formData state with sample data
                setFormData({
                    billing: sampleBillingData,
                    shipping: sampleShippingData,
                });
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const getRefundData = async () => {
        try {
            const res = await refundDataRefetch({
                orderId: id,
            });
            console.log('res: ', res);

            setRefundData(res?.data?.order);

            if (res?.data?.order?.status == 'UNFULFILLED') {
                if (res?.data?.order?.lines?.length > 0) {
                    const exceptRefundProduct = res?.data?.order?.lines
                        .filter((item) => item.quantityToFulfill !== 0)
                        .map((item) => ({
                            ...item,
                            quantity: item.quantityToFulfill, // Replace quantity with quantityToFulfill
                        }));
                    const initialQuantity = exceptRefundProduct.reduce((acc, item) => {
                        acc[item.id] = item.quantityToFulfill;
                        return acc;
                    }, {});

                    setInitialQuantity(initialQuantity);
                    setRefundProduct({ lines: exceptRefundProduct });

                    const alreadyRefundProduct = getRefundedLines(res?.data?.order?.fulfillments);
                    if (alreadyRefundProduct?.length > 0) {
                        setAlreadyRefundProduct(alreadyRefundProduct);
                    }
                    let disableLines = false;
                    if (res?.data?.order?.fulfillments?.length > 0) {
                        const refundProduct = res?.data?.order?.fulfillments?.filter((item) => item.status == 'REFUNDED');
                        disableLines = refundProduct?.some((item) => item.lines.length === 0);
                    }

                    setDisableLines(disableLines);
                }
            } else {
                if (res?.data?.order?.fulfillments?.length > 0) {
                    const filter = res?.data?.order?.fulfillments?.find((item) => item.status == 'FULFILLED');
                    console.log('filter: ', filter);
                    setRefundProduct(filter);

                    const initialQuantity = filter?.lines?.reduce((acc, item) => {
                        acc[item.id] = item.quantity;
                        return acc;
                    }, {});

                    setInitialQuantity(initialQuantity);

                    const alreadyRefundProduct = getRefundedLines(res?.data?.order?.fulfillments);
                    if (alreadyRefundProduct?.length > 0) {
                        setAlreadyRefundProduct(alreadyRefundProduct);
                    }
                }

                let disableLines = false;
                if (res?.data?.order?.fulfillments?.length > 0) {
                    const refundProduct = res?.data?.order?.fulfillments?.filter((item) => item.status == 'REFUNDED');
                    disableLines = refundProduct?.some((item) => item.lines.length === 0);
                }

                setDisableLines(disableLines);
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    // useEffect(() => {
    //     const newTotalAmount = refundProduct?.lines?.reduce((total, item) => {
    //         return total + (quantities[item.id] || 0) * item?.orderLine?.unitPrice?.gross?.amount;
    //     }, 0);
    //     setTotalAmount(newTotalAmount);
    // }, [quantities, refundProduct]);

    useEffect(() => {
        const newTotalAmount =
            refundProduct?.lines?.reduce((total, item) => {
                const quantity = quantities[item?.orderLine?.id || item?.id] || 0;
                const unitPrice = item?.orderLine?.unitPrice?.gross?.amount || item?.unitPrice?.gross?.amount;
                return total + quantity * unitPrice;
            }, 0) || 0; // Ensure that newTotalAmount is at least 0 if reduce returns undefined

        setTotalAmount(newTotalAmount);
    }, [quantities, refundProduct]);

    const sumOldCurrentBalance = (giftCards) => {
        const balanceMap = giftCards
            ?.flatMap((giftCard) => giftCard.events)
            ?.filter((event) => event.type === 'USED_IN_ORDER' && event.balance.oldCurrentBalance)
            ?.reduce((acc, event) => {
                const { amount, currency } = event.balance.oldCurrentBalance;
                if (!acc[currency]) {
                    acc[currency] = 0;
                }
                acc[currency] += amount;
                return acc;
            }, {});

        return Object.entries(balanceMap).map(([currency, amount]) => ({ currency, amount }));
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

    const getCountryList = () => {
        setLoading(true);
        if (countryData) {
            if (countryData && countryData?.shop && countryData?.shop?.countries?.length > 0) {
                setCountryList(countryData?.shop?.countries);
                setLoading(false);
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const SubmittedForm = Yup.object().shape({
        message: Yup.string().required('Please fill the message'),
    });

    const onSubmit = async (record: any, { resetForm }: any) => {
        try {
            setAddNoteLoading(true);
            const data = await addNotes({
                variables: { input: { message: record.message }, orderId: id, private_note: record.mail },
            });

            const newData = { ...orderData, events: data?.data?.orderNoteAdd?.order?.events };
            setOrderData(newData);
            getOrderDetails();
            resetForm();
            setAddNoteLoading(false);
        } catch (error) {
            setAddNoteLoading(false);

            console.log('error: ', error);
        }
    };

    const removeNotes = (item: any) => {
        showDeleteAlert(
            async () => {
                await deleteNotes({
                    variables: { noteId: item.id },
                });
                const filter = orderData?.events?.filter((data: any) => data.id !== item.id);
                const newData = { ...orderData, events: filter };
                setOrderData(newData);
                getOrderDetails();
                Swal.fire('Deleted!', 'Are you sure to delete noted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your notes list is safe :)', 'error');
            }
        );
    };

    const validationSchema = Yup.object().shape({
        billing: Yup.object().shape({
            firstName: Yup.string().required('First Name is required'),
            lastName: Yup.string().required('Last Name is required'),
            email: Yup.string().required('Email is required'),
            company: Yup.string().required('Company is required'),
            address_1: Yup.string().required('Street address is required'),
            // address_2: Yup.string().required('Street address is required'),
            city: Yup.string().required('City is required'),
            state: Yup.string().required('State is required'),
            country: Yup.string().required('Country is required'),
            phone: Yup.string().required('Phone is required'),
            paymentMethod: Yup.string().required('PaymentMethod is required'),
            transactionId: Yup.string().required('TransactionId is required'),

            // Add validation for other billing address fields here
        }),
        shipping: Yup.object().shape({
            firstName: Yup.string().required('First Name is required'),
            lastName: Yup.string().required('Last Name is required'),
            email: Yup.string().required('Email is required'),
            company: Yup.string().required('Company is required'),
            address_1: Yup.string().required('Street address is required'),
            // address_2: Yup.string().required('Street address is required'),
            city: Yup.string().required('City is required'),
            state: Yup.string().required('State is required'),
            country: Yup.string().required('Country is required'),
            phone: Yup.string().required('Phone is required'),
            paymentMethod: Yup.string().required('PaymentMethod is required'),
            transactionId: Yup.string().required('TransactionId is required'),
        }),
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');
        setFormData((prevData: any) => ({
            ...prevData,
            [section]: {
                ...prevData[section],
                [field]: value,
            },
        }));
        Yup.reach(validationSchema, name)
            .validate(value)
            .then(() => {
                // No validation error, clear the error message
                setErrors((prevErrors: any) => ({ ...prevErrors, [name]: '' }));
            })
            .catch((error: any) => {
                // Validation error, set the error message
                setErrors((prevErrors: any) => ({ ...prevErrors, [name]: error.message }));
            });
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

    const updateShipping = async () => {
        const res = await updateShippingCost({
            variables: {
                id: orderData?.id,
                input: {
                    shippingMethod: orderData?.shippingMethod?.id,
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
                    Success('Order status updated');
                }
                setOrderStatusLoading(false);
            } else {
                setOrderStatusLoading(false);

                Failure('Out of Stock');
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
                    getOrderDetails();
                    setIsPaymentOpen(false);
                    setTransactionLoading(false);
                    setRefError('');
                    Success('Payment status updated');
                }
            }
        } catch (error) {
            setTransactionLoading(false);
            console.log('error: ', error);
        }
    };

    const updateQuantity = async () => {
        try {
            const res = await updateLine({
                variables: {
                    id: isEdited.id,
                    input: {
                        quantity: productQuantity,
                    },
                },
            });
            getOrderData();
            setIsUpdateQty(false);
            setProductQuantity('');
            Success('Product Updated Successfully');
        } catch (error) {
            console.log('error: ', error);
        }
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
            setCurrencyLoading(true);
            const { data } = await draftOrder({
                variables: {
                    input: {
                        channelId: selectedCurrency == 'USD' ? 'Q2hhbm5lbDox' : 'Q2hhbm5lbDoy',
                    },
                },
            });
            localStorage.setItem('channel', selectedCurrency);
            setCurrencyLoading(false);
            setSelectedCurrency('');
            setIsOpenChannel(false);
            window.open(`/orders/new-order?orderId=${data?.draftOrderCreate?.order?.id}`);
        } catch (error) {
            setCurrencyLoading(false);

            console.log('error: ', error);
        }
    };

    const handleSubmit = async () => {
        try {
            setUpdateLoading(true);
            if (shippingPatner == '') {
                Success('Order updated successfully');
                setShippingError(true);
            } else if (trackingNumber == '') {
                Success('Order updated successfully');
                setTrackingError(true);
            } else {
                updateShippingProvider();
                updateTrackingNumber();
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
            setUpdateLoading(true);

            const res = await shippingProviderUpdate({
                variables: {
                    input: {
                        courierPartner: shippingPatner,
                    },
                    orderId: id,
                },
            });
            getOrderDetails();
            setUpdateLoading(false);
            Success('Order updated successfully');
        } catch (error) {
            setUpdateLoading(false);

            console.log('error: ', error);
        }
    };

    const updateTrackingNumber = async () => {
        try {
            setUpdateLoading(true);

            const res = await editTrackingNumber({
                variables: {
                    id: orderDetails?.order?.fulfillments[0]?.id,
                    input: {
                        trackingNumber,
                        notifyCustomer: true,
                    },
                },
            });
            getOrderDetails();
            setUpdateLoading(false);
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
                setWaitingStatus(status);
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
                    getOrderDetails();

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
            } else {
                orderCancelDraft();
            }
        } catch (error) {
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

    const confirmOrder = async (country?: any) => {
        try {
            setConfirmLoading(true);
            const res = await confirmNewOrder({
                variables: {
                    id: id,
                },
            });
            getOrderDetails();
            setConfirmLoading(false);
            Success('Order Confirmed Successfully');
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
            getOrderDetails();
            setInvoiceLoading(false);

            Success('Invoice generated Successfully');
        } catch (error) {
            setInvoiceLoading(false);

            console.log('error: ', error);
        }
    };

    const updateInvoice = async (country?: any) => {
        try {
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
                getOrderDetails();
                Failure('Invoice not updated');
            } else {
                const res = await updateInvoicePdf({
                    variables: {
                        invoiceId: orderData?.invoices[0]?.id,
                    },
                });
                setUpdateInvoideLoading(false);

                setOpenInvoice(false);
                getOrderDetails();

                Success('Invoice Updated Successfully');
            }
        } catch (error) {
            setUpdateInvoideLoading(false);

            console.log('error: ', error);
        }
    };

    const generatePayslip = async (country?: any) => {
        try {
            if (slipNumber == '') {
                setSlipNumberError('This field is required');
            } else if (slipDate == '') {
                setSlipDateError('This field is required');
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
                getOrderDetails();
                setSlipLoading(false);
                setSlipDateError('');
                setSlipNumberError('');
                Success('Payslip updated Successfully');
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

    const send_giftCart = async () => {
        try {
            setGiftCartLoading(true);

            const res = await sendGiftCart({
                variables: {
                    orderid: id,
                },
            });
            if (res?.data?.sendGiftCard?.errors?.length > 0) {
                Failure(res?.data?.sendGiftCard?.errors[0]?.message);
            } else {
                getOrderDetails();
                Success('Gift cart sent Successfully');
            }
            setGiftCartLoading(false);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleQuantityChange = (id, newQuantity) => {
        const refundLine = refundProduct?.lines?.find((item) => item?.id === id);
        const maxQuantity = refundLine ? refundLine.quantity : 0;
        setQuantities((prevQuantities) => ({
            ...prevQuantities,
            [id]: refundLine ? Math.min(newQuantity, maxQuantity) : 0,
        }));
    };

    const maxRefundCalculation = () => {
        let amt = null;

        if (orderData?.totalRefunded?.amount == 0) {
            amt = refundData?.total?.gross?.amount;
        } else {
            amt = refundData?.total?.gross?.amount - orderData?.totalRefunded?.amount;
        }

        let final = amt - (orderData?.shippingPrice?.gross?.amount + Number(orderData?.codAmount) + Number(orderData?.giftWrapAmount));
        setMaxRefundAmt(final);
        return final;
    };

    const setTotalAmountCalc = (item) => {
        let isDisable = false;
        const orderLineId = item?.orderLine?.id || item?.id;
        if (item?.orderLine?.quantity === 0 || item?.quantity === 0) {
            isDisable = true;
        }
        if (disableLines) {
            isDisable = true;
        }

        return isDisable;
    };

    const handleRefund = async () => {
        try {
            let input: any = {
                includeShippingCosts: false,
                orderLines: [],
                fulfillmentLines: [],
            };
            if (selectedItem == 'Manual Amount') {
                if (manualAmount == null && manualAmount == '') {
                    Failure('Please enter valid amount');
                } else {
                    input.amountToRefund = Number(manualAmount);
                    const response = await orderFullfilmentRefund({
                        variables: {
                            input,
                            order: id,
                        },
                    });
                    if (response?.data?.orderFulfillmentRefundProducts?.errors?.length > 0) {
                        Failure(response?.data?.orderFulfillmentRefundProducts?.errors[0]?.message);
                        setIsOpenRefund(false);
                    } else {
                        getRefundData();
                        setIsOpenRefund(false);
                        setSelectedItem(refundAmtType[0]);
                        const res = await getOrderDetails({
                            variables: {
                                id: id,
                                isStaffUser: true,
                            },
                        });
                        setManualAmount(null);
                        setManualAmtError('');
                        Success('Refund amount updated');
                    }
                }
            } else {
                if (maxRefundAmt < totalAmount) {
                    Failure(`Not allwed to Refund Amount.${'\n'}Max Refund Amount is ${addCommasToNumber(maxRefundAmt)}`);
                } else {
                    const filteredData = Object.entries(quantities)
                        .filter(([key, value]) => value !== 0)
                        .reduce((acc, [key, value]) => {
                            acc[key] = value;
                            return acc;
                        }, {});
                    if (isEmptyObject(filteredData)) {
                        Failure('Please select  a product quantity');
                    } else {
                        if (refundData?.status != 'UNFULFILLED') {
                            input.fulfillmentLines = Object.entries(filteredData)?.map(([key, value]) => ({
                                fulfillmentLineId: key,
                                quantity: value,
                            }));
                        } else {
                            input.orderLines = Object.entries(filteredData)?.map(([key, value]) => ({
                                orderLineId: key,
                                quantity: value,
                            }));
                        }

                        const response = await orderFullfilmentRefund({
                            variables: {
                                input,
                                order: id,
                            },
                        });
                        if (response?.data?.orderFulfillmentRefundProducts?.errors?.length > 0) {
                            Failure(response?.data?.orderFulfillmentRefundProducts?.errors[0]?.message);
                            setIsOpenRefund(false);
                        } else {
                            getRefundData();
                            setIsOpenRefund(false);
                            setSelectedItem(refundAmtType[0]);
                            const res = await getOrderDetails({
                                variables: {
                                    id: id,
                                    isStaffUser: true,
                                },
                            });
                            Success('Refund amount updated');
                        }
                    }
                }
            }
            setQuantities({});
        } catch (error) {
            console.error('Error processing refund:', error);
        }
    };

    const showRefundBtn = (data) => {
        let without_shipping_amount = Number(data?.total?.gross?.amount) - (Number(data?.shippingPrice?.gross?.amount) + Number(data?.codAmount) + Number(data?.giftWrapAmount));
        let totalRefunded = data?.totalRefunded?.amount;
        let show = false;
        if (totalRefunded < without_shipping_amount && (data?.paymentStatus == 'FULLY_CHARGED' || data?.paymentStatus == 'PARTIALLY_REFUNDED' || data.isPaid)) {
            show = true;
        }
        setShowRefundBtn(show);
    };

    const showRefundText = () => {
        let show = false;
        if (orderData?.fulfillments?.length > 0) {
            const filteredData = orderData?.fulfillments.filter((fulfillment) => fulfillment.status === 'REFUNDED');
            if (filteredData.length > 0) {
                show = true;
            }
        }
        return show;
    };

    const refundedAmount = () => {
        let refund;
        // if (freeShipping?.includes(orderData?.shippingMethod?.id) && refundStatus == 'FULLY_REFUNDED') {
        //     refund = orderData?.total?.gross?.amount;
        // } else {
        refund = orderData?.totalRefunded?.amount;
        // }
        return refund;
    };

    const netAmount = () => {
        let net;
        if (freeShipping?.includes(orderData?.shippingMethod?.id) && refundStatus == 'FULLY_REFUNDED') {
            net = 0;
        } else {
            net =
                orderData?.total?.gross?.amount -
                (orderData?.totalRefunded?.amount + Number(orderData?.shippingPrice?.gross?.amount) + Number(orderData?.codAmount) + Number(orderData?.giftWrapAmount));
        }
        return net;
    };

    const isDisableLines = () => {
        let isDisable = false;
        if (disableLines) {
            isDisable = true;
            setSelectedItem('Manual Amount');
        }
        return isDisable;
    };

    const applyAllProducts = (value) => {
        setApplyAllProduct(value);

        if (value) {
            setQuantities(initialQuantity);
        } else {
            const zeroQuantities = {};
            refundProduct?.lines?.forEach((product) => {
                const productId = product?.id;
                zeroQuantities[productId] = 0;
            });

            setQuantities(zeroQuantities);
        }
    };

    const getRefundedLines = (fulfillments) => {
        const refundedLines = [];

        fulfillments?.forEach((fulfillment) => {
            if (fulfillment.status === 'REFUNDED') {
                fulfillment?.lines.forEach((line) => {
                    const { quantity, orderLine } = line;
                    const { productName } = orderLine;
                    refundedLines.push({
                        productName,
                        quantity,
                        thubmnail: orderLine.variant?.product?.thumbnail?.url,
                        price: quantity * orderLine?.unitPrice?.gross?.amount,
                        cost: orderLine?.unitPrice?.gross?.amount,
                    });
                });
            }
        });

        return refundedLines;
    };

    return (
        <>
            <>
                <div className="panel mb-5 flex items-center justify-between gap-3 p-5 ">
                    <h3 className="text-lg font-semibold dark:text-white-light">Edit Order</h3>
                    <button type="button" className="btn btn-primary" onClick={() => setIsOpenChannel(true)}>
                        Add Order
                    </button>
                </div>
                <div className="grid grid-cols-12 gap-5 ">
                    <div className=" col-span-9 mb-5  ">
                        <div className="panel mb-5 p-5">
                            <div className="flex justify-between">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold">{`Order #${orderData?.number} Details`}</h3>
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
                                            value={moment(orderDetails?.order?.created).format('YYYY-MM-DDTHH:mm')}
                                            id="dateTimeCreated"
                                            name="dateTimeCreated"
                                            className="form-input"
                                            disabled
                                        />
                                    </div>
                                    {/* {orderStatus != 'UNCONFIRMED' && ( */}
                                    <>
                                        {/* {paymentStatus == 'FULLY_CHARGED' && ( */}
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
                                                <option value="NOT_CHARGET">Payment pending</option>
                                                <option value="FULLY_CHARGED">Payment completed</option>
                                                {/* <option value="FULLY_REFUNDED">Fully refunded</option>
                                                <option value="PARTIALLY_REFUNDED">Partially refunded</option> */}
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
                                    </>
                                    {/* )} */}
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-12 gap-5">
                                <div className="col-span-6 mr-5">
                                    <div className="flex w-52 items-center justify-between">
                                        <h5 className="mb-3 text-lg font-semibold">Billing</h5>
                                        {/* <button type="button" onClick={() => BillingInputs()}>
                                            <IconPencil className="cursor-pointer" />
                                        </button> */}
                                    </div>
                                    {showBillingInputs === false ? (
                                        <>
                                            <div className="mt-3 text-gray-500">
                                                <p>{`${formData?.billing?.firstName} ${formData?.billing?.lastName}`}</p>
                                                <p>{formData?.billing?.company}</p>
                                                <p>
                                                    {formData?.billing?.address_1},
                                                    <br /> {formData?.billing?.city},
                                                    {formData?.billing?.state && (
                                                        <>
                                                            <br /> {formData?.billing?.state}
                                                        </>
                                                    )}
                                                    ,
                                                    <br /> {formData?.billing?.countryArea},
                                                    <br /> {formData?.billing?.pincode}.
                                                </p>
                                                {formData?.billing?.email && (
                                                    <>
                                                        <p className="mt-3 font-semibold">Email Address:</p>
                                                        <p>
                                                            <a href={`mailto:${formData?.billing?.email}`} className="text-primary underline">
                                                                {formData?.billing?.email}
                                                            </a>
                                                        </p>
                                                    </>
                                                )}
                                                {formData?.billing?.phone && (
                                                    <>
                                                        <p className="mt-3 font-semibold">Phone:</p>
                                                        <p>
                                                            <a href={`tel:${formData?.billing?.phone}`} className="text-primary underline">
                                                                {formData?.billing?.phone}
                                                            </a>
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <a href="#" className="text-primary underline">
                                                Load billing address
                                            </a>

                                            <div className="mt-5 grid grid-cols-12 gap-3">
                                                <div className="col-span-6">
                                                    <label htmlFor="firstname" className=" text-sm font-medium text-gray-700">
                                                        First Name
                                                    </label>

                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['billing.firstName'] && 'border border-danger focus:border-danger'}`}
                                                        name="billing.firstName"
                                                        value={formData.billing.firstName}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['billing.firstName'] && <div className="mt-1 text-danger">{errors['billing.firstName']}</div>}
                                                </div>
                                                <div className="col-span-6">
                                                    <label htmlFor="Lastname" className=" text-sm font-medium text-gray-700">
                                                        Last Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['billing.lastName'] && 'border border-danger focus:border-danger'}`}
                                                        name="billing.lastName"
                                                        value={formData.billing.lastName}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['billing.lastName'] && <div className="mt-1 text-danger">{errors['billing.lastName']}</div>}
                                                </div>
                                            </div>

                                            <div className="mt-5 grid grid-cols-12 gap-3">
                                                <div className="col-span-12">
                                                    <label htmlFor="company" className=" text-sm font-medium text-gray-700">
                                                        Company
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['billing.company'] && 'border border-danger focus:border-danger'}`}
                                                        name="billing.company"
                                                        value={formData.billing.company}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['billing.company'] && <div className="mt-1 text-danger">{errors['billing.company']}</div>}
                                                </div>
                                            </div>

                                            <div className="mt-5 grid grid-cols-12 gap-3">
                                                <div className="col-span-6">
                                                    <label htmlFor="addressline1" className=" text-sm font-medium text-gray-700">
                                                        Addres Line 1
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['billing.address_1'] && 'border border-danger focus:border-danger'}`}
                                                        name="billing.address_1"
                                                        value={formData.billing.address_1}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['billing.address_1'] && <div className="mt-1 text-danger">{errors['billing.address_1']}</div>}

                                                    {/* <input type="text" id="billingaddress1" name="billingaddress1" className="form-input" required /> */}
                                                </div>
                                                {/* <div className="col-span-6">
                                                    <label htmlFor="addressline2" className=" text-sm font-medium text-gray-700">
                                                        Addres Line 2
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['billing.address_2'] && 'border border-danger focus:border-danger'}`}
                                                        name="billing.address_2"
                                                        value={formData.billing.address_2}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['billing.address_2'] && <div className="mt-1 text-danger">{errors['billing.address_2']}</div>}
                                                </div> */}
                                            </div>

                                            <div className="mt-5 grid grid-cols-12 gap-3">
                                                <div className="col-span-6">
                                                    <label htmlFor="city" className=" text-sm font-medium text-gray-700">
                                                        City
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['billing.city'] && 'border border-danger focus:border-danger'}`}
                                                        name="billing.city"
                                                        value={formData.billing.city}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['billing.city'] && <div className="mt-1 text-danger">{errors['billing.city']}</div>}
                                                </div>
                                                <div className="col-span-6">
                                                    <label htmlFor="pincode" className=" text-sm font-medium text-gray-700">
                                                        Post Code / ZIP
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['billing.pincode'] && 'border border-danger focus:border-danger'}`}
                                                        name="billing.pincode"
                                                        value={formData.billing.pincode}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['billing.pincode'] && <div className="mt-1 text-danger">{errors['billing.pincode']}</div>}
                                                </div>
                                            </div>

                                            <div className="mt-5 grid grid-cols-12 gap-3">
                                                <div className="col-span-6">
                                                    <label htmlFor="country" className=" text-sm font-medium text-gray-700">
                                                        Country / Region
                                                    </label>
                                                    <select
                                                        className={`form-select mr-3 ${errors['billing.country'] && 'border border-danger focus:border-danger'}`}
                                                        // className="form-select mr-3"
                                                        id="billingcountry"
                                                        name="billing.country"
                                                        value={formData.billing.country}
                                                        onChange={handleChange}
                                                        // value={selectedCountry}
                                                        // onChange={(e) => getStateList(e.target.value)}
                                                    >
                                                        {countryList?.map((item: any) => (
                                                            <option key={item.code} value={item.code}>
                                                                {item.country}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors['billing.country'] && <div className="mt-1 text-danger">{errors['billing.country']}</div>}
                                                </div>
                                                <div className="col-span-6">
                                                    <label htmlFor="state" className=" text-sm font-medium text-gray-700">
                                                        State / Country
                                                    </label>
                                                    <select
                                                        className={`form-select mr-3 ${errors['billing.state'] && 'border border-danger focus:border-danger'}`}
                                                        id="billingstate"
                                                        name="billing.state"
                                                        value={formData.billing.state}
                                                        onChange={handleChange}
                                                    >
                                                        {stateList?.map((item: any) => (
                                                            <option key={item.raw} value={item.raw}>
                                                                {item.raw}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors['billing.state'] && <div className="mt-1 text-danger">{errors['billing.state']}</div>}
                                                </div>
                                            </div>

                                            <div className="mt-5 grid grid-cols-12 gap-3">
                                                <div className="col-span-6">
                                                    <label htmlFor="email" className=" text-sm font-medium text-gray-700">
                                                        Email address
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['billing.email'] && 'border border-danger focus:border-danger'}`}
                                                        name="billing.email"
                                                        value={formData.billing.email}
                                                        maxLength={10}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['billing.email'] && <div className="mt-1 text-danger">{errors['billing.email']}</div>}
                                                    {/* <input type="mail" className="form-input" name="billing.email" value={formData.billing.email} onChange={handleChange} /> */}

                                                    {/* <input type="mail" id="billingemail" name="billingemail" className="form-input" required /> */}
                                                </div>
                                                <div className="col-span-6">
                                                    <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                                                        Phone
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['billing.phone'] && 'border border-danger focus:border-danger'}`}
                                                        name="billing.phone"
                                                        value={formData.billing.phone}
                                                        maxLength={10}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['billing.phone'] && <div className="mt-1 text-danger">{errors['billing.phone']}</div>}
                                                </div>
                                            </div>

                                            {/* <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-12">
                                                        <label htmlFor="payments" className=" text-sm font-medium text-gray-700">
                                                            Payment method:
                                                        </label>
                                                        <select
                                                            className="form-select mr-3"
                                                            id="billingpayments"
                                                            name="billing.paymentMethod"
                                                            value={formData.billing.paymentMethod}
                                                            onChange={handleChange}
                                                        >
                                                            <option value="private-note">Private note</option>
                                                            <option value="note-customer">Note to customer</option>
                                                        </select>
                                                    </div>
                                                </div> */}

                                            {/* <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-12">
                                                        <label htmlFor="transaction" className=" text-sm font-medium text-gray-700">
                                                            Transaction ID
                                                        </label>
                                                        <input type="text" className="form-input" name="billing.transactionId" value={formData.billing.transactionId} onChange={handleChange} />

                                                    </div>
                                                </div> */}
                                        </>
                                    )}
                                </div>

                                <div className="col-span-6 mr-5">
                                    <div className="flex w-52 items-center justify-between">
                                        <h5 className="mb-3 text-lg font-semibold">Shipping</h5>
                                        {/* <button type="button" onClick={() => ShippingInputs()}>
                                            <IconPencil />
                                        </button> */}
                                    </div>

                                    {showShippingInputs === false ? (
                                        <>
                                            <div className="mt-3 text-gray-500">
                                                <p>{`${formData?.shipping?.firstName} ${formData?.shipping?.lastName}`}</p>
                                                <p>{formData?.shipping?.company}</p>
                                                <p>
                                                    {formData?.shipping?.address_1},
                                                    <br /> {formData?.shipping?.city},
                                                    {formData?.shipping?.state && (
                                                        <>
                                                            <br /> {formData?.shipping?.state}
                                                        </>
                                                    )}
                                                    ,
                                                    <br /> {formData?.shipping?.countryArea},
                                                    <br /> {formData?.shipping?.pincode}.
                                                </p>
                                                {formData?.shipping?.email && (
                                                    <>
                                                        <p className="mt-3 font-semibold">Email Address:</p>
                                                        <p>
                                                            <a href={`mailto:${formData?.shipping?.email}`} className="text-primary underline">
                                                                {formData?.shipping?.email}
                                                            </a>
                                                        </p>
                                                    </>
                                                )}
                                                {formData?.shipping?.phone && (
                                                    <>
                                                        <p className="mt-3 font-semibold">Phone:</p>
                                                        <p>
                                                            <a href={`tel:${formData?.shipping?.phone}`} className="text-primary underline">
                                                                {formData?.shipping?.phone}
                                                            </a>
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <a href="#" className="mr-3 text-primary underline">
                                                Load Shipping address
                                            </a>
                                            <a href="#" className="text-primary underline">
                                                Copy Billing address
                                            </a>

                                            <div className="mt-5 grid grid-cols-12 gap-3">
                                                <div className="col-span-6">
                                                    <label htmlFor="firstname" className=" text-sm font-medium text-gray-700">
                                                        First Name
                                                    </label>

                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['shipping.firstName'] && 'border border-danger focus:border-danger'}`}
                                                        name="shipping.firstName"
                                                        value={formData.shipping.firstName}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['shipping.firstName'] && <div className="mt-1 text-danger">{errors['shipping.firstName']}</div>}
                                                </div>
                                                <div className="col-span-6">
                                                    <label htmlFor="Lastname" className=" text-sm font-medium text-gray-700">
                                                        Last Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['shipping.lastName'] && 'border border-danger focus:border-danger'}`}
                                                        name="shipping.lastName"
                                                        value={formData.shipping.lastName}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['shipping.lastName'] && <div className="mt-1 text-danger">{errors['shipping.lastName']}</div>}
                                                </div>
                                            </div>

                                            <div className="mt-5 grid grid-cols-12 gap-3">
                                                <div className="col-span-12">
                                                    <label htmlFor="company" className=" text-sm font-medium text-gray-700">
                                                        Company
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['shipping.company'] && 'border border-danger focus:border-danger'}`}
                                                        name="shipping.company"
                                                        value={formData.shipping.company}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['shipping.company'] && <div className="mt-1 text-danger">{errors['shipping.company']}</div>}
                                                </div>
                                            </div>

                                            <div className="mt-5 grid grid-cols-12 gap-3">
                                                <div className="col-span-6">
                                                    <label htmlFor="addressline1" className=" text-sm font-medium text-gray-700">
                                                        Addres Line 1
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['shipping.address_1'] && 'border border-danger focus:border-danger'}`}
                                                        name="shipping.address_1"
                                                        value={formData.shipping.address_1}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['shipping.address_1'] && <div className="mt-1 text-danger">{errors['shipping.address_1']}</div>}

                                                    {/* <input type="text" id="shippingaddress1" name="shippingaddress1" className="form-input" required /> */}
                                                </div>
                                                {/* <div className="col-span-6">
                                                    <label htmlFor="addressline2" className=" text-sm font-medium text-gray-700">
                                                        Addres Line 2
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['shipping.address_2'] && 'border border-danger focus:border-danger'}`}
                                                        name="shipping.address_2"
                                                        value={formData.shipping.address_2}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['shipping.address_2'] && <div className="mt-1 text-danger">{errors['shipping.address_2']}</div>}
                                                </div> */}
                                            </div>

                                            <div className="mt-5 grid grid-cols-12 gap-3">
                                                <div className="col-span-6">
                                                    <label htmlFor="city" className=" text-sm font-medium text-gray-700">
                                                        City
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['shipping.city'] && 'border border-danger focus:border-danger'}`}
                                                        name="shipping.city"
                                                        value={formData.shipping.city}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['shipping.city'] && <div className="mt-1 text-danger">{errors['shipping.city']}</div>}
                                                </div>
                                                <div className="col-span-6">
                                                    <label htmlFor="pincode" className=" text-sm font-medium text-gray-700">
                                                        Post Code / ZIP
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['shipping.pincode'] && 'border border-danger focus:border-danger'}`}
                                                        name="shipping.pincode"
                                                        value={formData.shipping.pincode}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['shipping.pincode'] && <div className="mt-1 text-danger">{errors['shipping.pincode']}</div>}
                                                </div>
                                            </div>

                                            <div className="mt-5 grid grid-cols-12 gap-3">
                                                <div className="col-span-6">
                                                    <label htmlFor="country" className=" text-sm font-medium text-gray-700">
                                                        Country / Region
                                                    </label>
                                                    <select
                                                        className={`form-select mr-3 ${errors['shipping.country'] && 'border border-danger focus:border-danger'}`}
                                                        // className="form-select mr-3"
                                                        id="shippingcountry"
                                                        name="shipping.country"
                                                        value={formData.shipping.country}
                                                        onChange={handleChange}
                                                        // value={selectedCountry}
                                                        // onChange={(e) => getStateList(e.target.value)}
                                                    >
                                                        {countryList?.map((item: any) => (
                                                            <option key={item.code} value={item.code}>
                                                                {item.country}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors['shipping.country'] && <div className="mt-1 text-danger">{errors['shipping.country']}</div>}
                                                </div>
                                                <div className="col-span-6">
                                                    <label htmlFor="state" className=" text-sm font-medium text-gray-700">
                                                        State / Country
                                                    </label>
                                                    <select
                                                        className={`form-select mr-3 ${errors['shipping.state'] && 'border border-danger focus:border-danger'}`}
                                                        id="shippingstate"
                                                        name="shipping.state"
                                                        value={formData.shipping.state}
                                                        onChange={handleChange}
                                                    >
                                                        {stateList?.map((item: any) => (
                                                            <option key={item.raw} value={item.raw}>
                                                                {item.raw}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors['shipping.state'] && <div className="mt-1 text-danger">{errors['shipping.state']}</div>}
                                                </div>
                                            </div>

                                            <div className="mt-5 grid grid-cols-12 gap-3">
                                                <div className="col-span-6">
                                                    <label htmlFor="email" className=" text-sm font-medium text-gray-700">
                                                        Email address
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${errors['shipping.email'] && 'border border-danger focus:border-danger'}`}
                                                        name="shipping.email"
                                                        value={formData.shipping.email}
                                                        maxLength={10}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['shipping.email'] && <div className="mt-1 text-danger">{errors['shipping.email']}</div>}
                                                    {/* <input type="mail" className="form-input" name="shipping.email" value={formData.shipping.email} onChange={handleChange} /> */}

                                                    {/* <input type="mail" id="shippingemail" name="shippingemail" className="form-input" required /> */}
                                                </div>
                                                <div className="col-span-6">
                                                    <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                                                        Phone
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className={`form-input ${errors['shipping.phone'] && 'border border-danger focus:border-danger'}`}
                                                        name="shipping.phone"
                                                        value={formData.shipping.phone}
                                                        maxLength={10}
                                                        onChange={handleChange}
                                                    />
                                                    {errors['shipping.phone'] && <div className="mt-1 text-danger">{errors['shipping.phone']}</div>}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="text-md">User Email :</div>
                                <div className="text-primary underline">{orderData?.userEmail}</div>
                            </div>

                            <div className="mt-5">
                                {showRefundText() && (
                                    <div className="col-span-4">
                                        <label htmlFor="regularPrice" className="block pr-2 text-sm font-medium text-gray-700">
                                            Refund Status:
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl bg-green-100 p-2 text-sm font-semibold text-green-700">{refundStatus}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="panel p-5">
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Cost</th>
                                            <th>Qty</th>
                                            <th>Total</th>

                                            <th>GST</th>

                                            {/* <th>Action</th> */}
                                            {/* <th className="w-1"></th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lines?.length > 0 &&
                                            lines?.map((item: any, index: any) => (
                                                <tr className="panel align-top" key={index}>
                                                    <td className="flex ">
                                                        <img src={item?.variant?.product?.thumbnail?.url} height={50} width={50} alt="Selected" className="object-cover" />
                                                        <div>
                                                            <div className="pl-5">{item?.productName}</div>
                                                            {item?.productSku && (
                                                                <div className="flex items-center">
                                                                    <h4 className="pl-5 text-[12px]">SKU:</h4>
                                                                    <div className="pl-1 text-[12px] text-gray-500">{item?.productSku}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {item?.unitPrice?.net?.currency == 'USD' ? (
                                                        <td>{`${formatCurrency(item?.unitPrice?.net?.currency)}${addCommasToNumber(item?.unitPrice?.net?.amount)}`} </td>
                                                    ) : (
                                                        <td>{`${formatCurrency(item?.unitPrice?.net?.currency)}${addCommasToNumber(item?.unitPrice?.net?.amount)}`} </td>
                                                    )}
                                                    <td>
                                                        <div>× {item?.quantity}</div>
                                                    </td>
                                                    {/* <td>{`${formatCurrency(item?.unitPrice?.gross?.currency)}${addCommasToNumber(item?.unitPrice?.gross?.amount)}`} </td> */}
                                                    <td>
                                                        <div> {`${formatCurrency(item?.totalPrice?.gross?.currency)}${addCommasToNumber(item?.totalPrice?.gross?.amount)}`}</div>{' '}
                                                    </td>
                                                    {formData?.billing?.state !== '' && formData?.shipping?.state == 'Tamil Nadu' ? (
                                                        <td>
                                                            <div>{`SGST: ${formatCurrency(item?.unitPrice?.tax?.currency)}${roundOff(item?.unitPrice?.tax?.amount / 2)}`}</div>
                                                            <span className="ml-10">+</span>
                                                            <div>{`CSGT: ${formatCurrency(item?.unitPrice?.tax?.currency)}${roundOff(item?.unitPrice?.tax?.amount / 2)}`}</div>
                                                        </td>
                                                    ) : (
                                                        <td>
                                                            <div>{`IGST: ${formatCurrency(item?.unitPrice?.tax?.currency)}${roundOff(item?.unitPrice?.tax?.amount)}`}</div>
                                                        </td>
                                                    )}
                                                    {/* <td>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setProductQuantity(item?.quantity);
                                                                    setIsUpdateQty(true);
                                                                    setIsEdited(item);
                                                                    // setState({ editProduct: item, isEditProduct: true, isOpenProductAdd: true, productQuantity: item?.quantity });
                                                                }}
                                                            >
                                                                <IconPencil className="mr-3 h-5 w-5" />
                                                            </button>
                                                            <button type="button" onClick={() => deleteProduct(item)}>
                                                                <IconTrashLines className="h-5 w-5" />
                                                            </button>
                                                        </td> */}
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                                <div className="mb-6 sm:mb-0"></div>
                                <div className="sm:w-2/5">
                                    <div className="flex items-center justify-between">
                                        <div>Items Subtotal:</div>
                                        <div>{`${formatCurrency(orderData?.subtotal?.net?.currency)}${addCommasToNumber(orderData?.subtotal?.net?.amount)}`}</div>
                                    </div>
                                    {orderDetails?.order?.giftCards?.length > 0 && (
                                        <div className="mt-4 flex  justify-between">
                                            <div>Coupon Amount</div>
                                            <div>
                                                <div className="ml-[94px] items-end">{`${formatCurrency(coupenAmt?.currency)}${addCommasToNumber(coupenAmt?.amount)}`}</div>
                                            </div>
                                        </div>
                                    )}
                                    {orderData?.discounts?.length > 0 && (
                                        <div className="mt-4 flex items-center justify-between">
                                            <div>Discount</div>
                                            <div>
                                                {orderData?.discounts[0]?.amount?.currency == 'USD' ? '$' : '₹'}
                                                {addCommasToNumber(orderData?.discounts[0]?.amount?.amount)}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-4 flex  justify-between">
                                        <div>{orderData?.paymentMethod?.name == 'Cash On delivery' ? 'COD Fee:' : 'Shipping:'}</div>
                                        <div>
                                            {orderData?.paymentMethod?.name == 'Cash On delivery' ? (
                                                <div className="ml-[94px] items-end">{`${formatCurrency(orderData?.subtotal?.gross?.currency)}${orderData?.codAmount}`}</div>
                                            ) : (
                                                <div className="ml-[94px] items-end">
                                                    {`${formatCurrency(orderData?.shippingPrice?.gross?.currency)}${addCommasToNumber(orderData?.shippingPrice?.gross?.amount)}`}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {isGiftWrap && (
                                        <div className="mt-4 flex  justify-between">
                                            <div>Gift Wrap:</div>
                                            <div>
                                                <div className="ml-[94px] items-end">{`${formatCurrency(orderData?.subtotal?.gross?.currency)}${orderData?.giftWrapAmount}`}</div>
                                            </div>
                                        </div>
                                    )}
                                    {formData?.billing?.state !== '' && formData?.shipping?.state == 'Tamil Nadu' ? (
                                        <>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div>SGST:</div>
                                                <div>
                                                    <div>{`${formatCurrency(orderData?.total?.tax?.currency)}${addCommasToNumber(orderData?.total?.tax?.amount / 2)}`}</div>

                                                    {/* {orderData?.subtotal?.tax?.currency} {orderData?.subtotal?.tax?.amount / 2} */}
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div>CSGT:</div>
                                                <div>
                                                    <div>{`${formatCurrency(orderData?.total?.tax?.currency)}${addCommasToNumber(orderData?.total?.tax?.amount / 2)}`}</div>

                                                    {/* {orderData?.subtotal?.tax?.currency} {orderData?.subtotal?.tax?.amount / 2} */}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="mt-4 flex items-center justify-between">
                                            <div>IGST:</div>
                                            <div>
                                                <div>{`${formatCurrency(orderData?.total?.tax?.currency)}${addCommasToNumber(orderData?.total?.tax?.amount)}`}</div>

                                                {/* {orderData?.subtotal?.gross?.currency} {orderData?.subtotal?.gross?.amount} */}
                                            </div>
                                        </div>
                                    )}
                                    {/* <div className="mt-4 flex items-center justify-between">
                                            <div>Tax(%)</div>
                                            <div>{orderData?.total?.tax?.amount}</div>
                                        </div> */}

                                    <div className="mt-4 flex items-center justify-between font-semibold">
                                        <div>Order Total:</div>
                                        <div>
                                            <div className="ml-[98px] justify-end">{`${formatCurrency(orderData?.total?.gross?.currency)}${addCommasToNumber(orderData?.total?.gross?.amount)}`}</div>

                                            {/* <div className="pl-3 text-sm">
                                                (includes {orderData?.total?.tax?.currency == 'USD' ? '$' : '₹'}
                                                {roundOff(orderData?.total?.tax?.amount)} GST)
                                            </div> */}
                                        </div>
                                    </div>

                                    {orderData?.paymentStatus == 'PARTIALLY_REFUNDED' ||
                                        orderData?.paymentStatus == 'FULLY_CHARGED' ||
                                        (orderData?.paymentStatus == 'FULLY_REFUNDED' && (
                                            <div className="border-1 mt-4 flex items-center justify-between border-t-black font-semibold">
                                                <div>Paid Amount</div>
                                                <div>
                                                    <div className="ml-[90px] justify-end">{`${formatCurrency(orderData?.total?.gross?.currency)}${addCommasToNumber(
                                                        orderData?.total?.gross?.amount
                                                    )}`}</div>

                                                    {/* <div className=" text-sm">
                                               {`${orderData?.total?.tax?.currency == 'USD' ? '$' : '₹'} ${roundOff(orderData?.total?.tax?.amount)} `}
                                            </div> */}
                                                </div>
                                            </div>
                                        ))}
                                    {showRefundText() && (
                                        <>
                                            <div className="mt-4 flex items-center justify-between font-semibold">
                                                <div>Refunded Amount:</div>
                                                <div>
                                                    <div className="ml-[50px] justify-end">{`${formatCurrency(orderData?.totalRefunded?.currency)}${addCommasToNumber(refundedAmount())}`}</div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between font-semibold">
                                                <div>Net Amount:</div>
                                                <div>
                                                    <div className="pl-3 text-sm">{`${formatCurrency(orderData?.totalRefunded?.currency)}${addCommasToNumber(netAmount())}`}</div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            {showRefundButton && (
                                <div className=" mb-5 mt-5  ">
                                    <div className=" pt-3">
                                        <button onClick={() => setIsOpenRefund(true)} className="btn btn-primary">
                                            {updateLoading ? <IconLoader /> : 'Refund'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {isGiftCart ? (
                            orderData?.giftCardsPurchased?.length > 0 ? (
                                <>
                                    <h5 className="m-3 text-lg font-semibold">Gift Cards</h5>

                                    <div className="panel p-5">
                                        <div className="table-responsive">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Code</th>
                                                        <th>Amount</th>

                                                        <th>Created By</th>
                                                        <th>Last Used On</th>
                                                        <th>Used By</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orderData?.giftCardsPurchased?.length > 0 &&
                                                        orderData?.giftCardsPurchased?.map((item: any, index: any) => (
                                                            <tr className="panel align-top" key={index}>
                                                                <td>
                                                                    <div className="pl-5">{item?.code}</div>
                                                                </td>
                                                                <td>
                                                                    <div className="pl-5">
                                                                        {formatCurrency(item?.currentBalance?.currency)}
                                                                        {item?.currentBalance?.amount}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="pl-5">{item?.createdByEmail ? item?.createdByEmail : '-'}</div>
                                                                </td>
                                                                <td>
                                                                    <div className="pl-5">{item?.lastUsedOn ? moment(item?.lastUsedOn).format('YYYY-MM-DD HH:mm') : '-'}</div>
                                                                </td>
                                                                <td>
                                                                    <div className="pl-5">{item?.usedByEmail ? item?.usedByEmail : '-'}</div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-5 flex justify-end">
                                            <button onClick={() => send_giftCart()} className="btn btn-outline-primary">
                                                {giftCartLoading ? <IconLoader /> : 'Send Gift cart'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="mt-5 flex justify-end">
                                    <button onClick={() => send_giftCart()} className="btn btn-outline-primary">
                                        {giftCartLoading ? <IconLoader /> : 'Send Gift cart'}
                                    </button>
                                </div>
                            )
                        ) : null}{' '}
                        <>
                            {orderData?.customerNote && (
                                <>
                                    <h5 className="m-3 text-lg font-semibold">Notes</h5>

                                    <div className="panel p-5">
                                        <div>{orderData?.customerNote}</div>
                                    </div>
                                </>
                            )}
                        </>
                    </div>

                    <div className="col-span-3">
                        {orderStatus != 'UNCONFIRMED' && (
                            <>
                                <div className="panel mb-5 p-5">
                                    <div className="mb-5 border-b border-gray-200 pb-2 ">
                                        <h3 className="text-lg font-semibold">Order Actions</h3>
                                    </div>
                                    {orderStatus == 'FULFILLED' && (
                                        <div className="col-span-4 pb-4">
                                            <div className="items-center justify-between ">
                                                <label htmlFor="status" className="block pr-2 text-sm font-medium text-gray-700">
                                                    Shipping Provider
                                                </label>
                                            </div>

                                            <select className="form-select" value={shippingPatner} onChange={(e) => setShippingPatner(e.target.value)}>
                                                <option value="">Choose Shipping Provider</option>
                                                {customerData?.map((item: any) => (
                                                    <option key={item?.node?.id} value={item?.node?.id}>
                                                        {item?.node?.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {shippingPatner == '' && shippingError && <div className=" text-danger">Required this field</div>}
                                            <input type="text" className={`form-input mt-4`} placeholder="Tracking number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                                            {trackingNumber == '' && trackingError && <div className=" text-danger">Required this field</div>}
                                        </div>
                                    )}
                                    <div>
                                        {/* <select className="form-select mr-3">
                                            <option value="">Choose An Action</option>
                                            <option value="Email Invoice">Email Invoice</option>
                                        </select> */}
                                    </div>
                                    <div className={`mt-5 flex justify-between ${orderStatus == 'FULFILLED' && 'border-t'} border-gray-200 pb-2 `}>
                                        <div className=" pt-3">
                                            <button onClick={() => handleSubmit()} className="btn btn-outline-primary">
                                                {updateLoading ? <IconLoader /> : 'Update'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="panel mb-5 max-h-[810px]  overflow-y-auto p-5">
                            <div className="mb-5 border-b border-gray-200 pb-2 ">
                                <h3 className="text-lg font-semibold">Order Notes</h3>
                            </div>
                            <div className="mb-5 border-b border-gray-200 pb-2 ">
                                {notesList?.length > 0 ? (
                                    notesList?.map((data: any, index: number) => (
                                        <div className="mb-5" key={index}>
                                            <div className="text-gray-500">
                                                <div className=" mb-2 bg-gray-100  p-3 ">{data?.message}</div>
                                                <span className=" mr-1 border-b border-dotted border-gray-500">{moment(data?.date).format('MMMM DD, YYYY [at] HH:mm a')}</span>
                                                {data?.user && data?.user?.email && `by ${data.user.email}`}
                                                {data?.type == 'NOTE_ADDED' && (
                                                    <span className="ml-2 cursor-pointer text-danger" onClick={() => removeNotes(data)}>
                                                        Delete note
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <span className=" mr-1 border-b border-dotted border-gray-500">No data found</span>
                                )}
                            </div>
                            <Formik
                                initialValues={{ message: '', mail: false }}
                                validationSchema={SubmittedForm}
                                onSubmit={(values, { resetForm }) => {
                                    onSubmit(values, { resetForm }); // Call the onSubmit function with form values and resetForm method
                                }}
                            >
                                {({ errors, submitCount, touched, setFieldValue, values }) => (
                                    <Form>
                                        <label className="text-gray-700">Add note</label>
                                        <Field name="message" component="textarea" id="message" placeholder="Add a note" className="form-textarea" />

                                        {errors.message && touched.message && <div className="mt-1 text-danger">{errors.message}</div>}
                                        {/* <textarea className="form-textarea" rows="2" placeholder="Add a note"></textarea> */}

                                        <div className="mt-3 flex items-center justify-between">
                                            <select
                                                className="form-select mr-3"
                                                onChange={(e) => {
                                                    const modeValue = e.target.value === 'private-note';
                                                    setFieldValue('mail', modeValue);
                                                }}
                                            >
                                                <option value="private-note">Private note</option>
                                                <option value="note-customer">Note to customer</option>
                                            </select>
                                            <button type="submit" className="btn btn-outline-primary">
                                                {addNoteLoading ? <IconLoader /> : 'Add'}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>

                        <div className="panel mb-5  max-h-[810px] overflow-y-auto p-5">
                            <div className=" flex items-center justify-between border-b border-gray-200 pb-2 ">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {' '}
                                    <h3 className="text-lg font-semibold">Payslip </h3>
                                    <IconDownload />
                                </div>
                                {orderData?.metadata?.length > 0 && (
                                    <button
                                        type="submit"
                                        // className="btn btn-outline-primary"
                                        onClick={() => {
                                            if (orderDetails?.order?.metadata?.length > 0) {
                                                setSlipDate(mintDateTime(orderDetails?.order?.metadata[0]?.value));
                                                setSlipNumber(orderDetails?.order?.metadata[1]?.value);
                                                setIsOpenPayslip(true);
                                            }
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
                                    <div className="flex justify-between">
                                        <p>Date</p>
                                        <p>{moment(orderData?.metadata[0]?.value).format('YYYY/MM/DD')}</p>
                                    </div>
                                    <div className="flex justify-between pt-3">
                                        <button type="submit" className="btn btn-primary" onClick={() => payslipSend()}>
                                            {sendPayslipLoading ? <IconLoader /> : 'Send'}
                                        </button>
                                        <button type="submit" className="btn btn-outline-primary" onClick={() => window.open('http://file.prade.in' + orderData?.metadata[2]?.value, '_blank')}>
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

                        <div className="panel max-h-[810px]  overflow-y-auto p-5">
                            <div className=" flex items-center justify-between border-b border-gray-200 pb-2 ">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <h3 className="text-lg font-semibold">Invoice</h3>
                                    <IconDownload />
                                </div>
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
                                (orderStatus == 'FULFILLED' || orderStatus == 'CANCELED') && (
                                    <div className="flex justify-end pt-5">
                                        <button type="submit" className="btn btn-primary" onClick={() => generateInvoice()}>
                                            {invoiceLoading ? <IconLoader /> : 'Generate'}
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </>

            <Modal
                addHeader={'Update Quantity'}
                open={isUpdateQty}
                close={() => setIsUpdateQty(false)}
                renderComponent={() => (
                    <>
                        <div className="p-5">
                            <div className="p-5">
                                <input type="number" className="form-input" value={productQuantity} onChange={(e) => setProductQuantity(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-5">
                                <button
                                    onClick={() => setIsUpdateQty(false)}
                                    className="rounded border border-black bg-transparent px-4 py-2 font-semibold text-black hover:border-transparent hover:bg-blue-500 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => updateQuantity()}
                                    className="rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-500 hover:border-transparent hover:bg-blue-500 hover:text-white"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </>
                )}
            />

            <Modal
                addHeader={'Update Discount'}
                open={discountOpen}
                close={() => setDiscountOpen(false)}
                renderComponent={() => (
                    <div className="p-10 pb-7">
                        <form onSubmit={updateDiscount}>
                            <div className=" flex justify-between">
                                <label htmlFor="name">Discount</label>
                            </div>
                            <div className="flex w-full">
                                {/* <select id="user" className="form-select" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                                            {productList?.map((items)=>
                                            <option value={items.value}>={items.name}</option>
                                            )}
                                           
                                        </select> */}
                                <input
                                    type="number"
                                    className="form-input "
                                    // placeholder="Quantity"
                                    // defaultValue={item.quantity}
                                    value={discount}
                                    onChange={(e: any) => setDiscount(e.target.value)}
                                    min={0}
                                    // onChange={(e) => changeQuantityPrice('quantity', e.target.value, item.id)}
                                />
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <button type="button" className="btn btn-outline-danger gap-2" onClick={() => setDiscountOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                    {'Update Discount'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            />

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
                    setSlipDateError('');
                    setSlipNumberError('');
                    setIsOpenPayslip(false);
                }}
                renderComponent={() => (
                    <div className="p-5 pb-7">
                        <form className="flex flex-col gap-3">
                            <div className=" w-full">
                                <input type="text" className="form-input" placeholder="Slip Number" value={slipNumber} onChange={(e: any) => setSlipNumber(e.target.value)} />
                                {slipNumberError && <div className="mt-1 text-danger">{slipNumberError}</div>}
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
                                {slipDateError && <div className="mt-1 text-danger">{slipDateError}</div>}

                                {/* <input type="text" className="form-input" placeholder="Slip Date" value={slipDate} onChange={(e: any) => slipDate(e.target.value)} /> */}
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger gap-2"
                                    onClick={() => {
                                        setSlipDateError('');
                                        setSlipNumberError('');
                                        setIsOpenPayslip(false);
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
                close={() => setOpenInvoice(false)}
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
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <button type="button" className="btn btn-outline-danger gap-2" onClick={() => setOpenInvoice(false)}>
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
                addHeader={'Update shipping Cost'}
                open={shippingOpen}
                close={() => setShippingOpen(false)}
                renderComponent={() => (
                    <div className="p-10 pb-7">
                        <form onSubmit={updateShipping}>
                            <div className="flex w-full">
                                {/* <select id="user" className="form-select" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                                            {productList?.map((items)=>
                                            <option value={items.value}>={items.name}</option>
                                            )}
                                           
                                        </select> */}
                                <input
                                    type="number"
                                    className="form-input "
                                    // placeholder="Quantity"
                                    // defaultValue={item.quantity}
                                    value={shippingPrice}
                                    onChange={(e: any) => setShippingPrice(e.target.value)}
                                    min={0}
                                    // onChange={(e) => changeQuantityPrice('quantity', e.target.value, item.id)}
                                />
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <button type="button" className="btn btn-outline-danger gap-2" onClick={() => setShippingOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                    {'Update shipping cost'}
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

            <Modal
                addHeader={'Select a Currency'}
                open={isOpenChannel}
                close={() => setIsOpenChannel(false)}
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
                            {channels?.map((item) => (
                                <option key={item?.value} value={item?.value}>
                                    {item?.label}
                                </option>
                            ))}
                        </select>
                        {currencyPopup && <div className="mt-1 text-sm text-red-400">{currencyPopup}</div>}

                        <div className="mt-8 flex items-center justify-end">
                            <button type="button" className="btn btn-outline-danger gap-2" onClick={() => setIsOpenChannel(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => handleSetChannel()}>
                                {currencyLoading ? <IconLoader /> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                )}
            />

            <Modal
                addHeader={'Refunds'}
                open={isOpenRefund}
                isFullWidth
                close={() => setIsOpenRefund(false)}
                renderComponent={() => (
                    <div className="panel p-5">
                        {alreadyRefundProduct?.length > 0 && (
                            <>
                                <div className="text-lg font-medium dark:bg-[#121c2c] ">Already Refunded Items :</div>

                                <div className="table-responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Item</th>

                                                <th className="w-1">Cost</th>
                                                <th className="w-1">Qty</th>
                                                <th>Total</th>

                                                <th className="w-1"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {alreadyRefundProduct?.map((item: any, index: any) => (
                                                <tr className="panel align-top" key={index}>
                                                    <td className="flex ">
                                                        <img src={item?.thubmnail} height={50} width={50} alt="Selected" className="object-cover" />

                                                        <div>
                                                            <div className="pl-5">{item?.productName}</div>
                                                        </div>
                                                    </td>

                                                    <td>{item?.cost}</td>
                                                    <td>{item?.quantity}</td>

                                                    <td>{item?.price}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                        <div className="panel p-5">
                            {refundProduct?.lines?.length > 0 && (
                                <>
                                    <div className="text-lg font-medium dark:bg-[#121c2c] "> Items to Refund:</div>

                                    <div className="table-responsive">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Item</th>

                                                    <th className="w-1">Cost</th>
                                                    <th className="w-1">Qty</th>
                                                    <th>Total</th>

                                                    <th className="w-1"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {refundProduct?.lines?.map((item: any, index: any) => (
                                                    <tr
                                                        className="panel align-top"
                                                        key={index}
                                                        style={{
                                                            opacity: isDisableLines() ? 0.5 : 1,
                                                        }}
                                                    >
                                                        <td className="flex ">
                                                            {item?.variant ? (
                                                                <img src={item?.variant?.product?.thumbnail?.url} height={50} width={50} alt="Selected" className="object-cover" />
                                                            ) : (
                                                                <img src={item?.orderLine?.variant?.product?.thumbnail?.url} height={50} width={50} alt="Selected" className="object-cover" />
                                                            )}
                                                            <div>
                                                                <div className="pl-5">{item?.productName}</div>
                                                                <div className="pl-5">{item?.productSku}</div>
                                                            </div>
                                                        </td>
                                                        {item?.unitPrice ? (
                                                            <td>{`${formatCurrency(item?.unitPrice?.gross?.currency)}${addCommasToNumber(item?.unitPrice?.gross?.amount)}`} </td>
                                                        ) : (
                                                            <td>{`${formatCurrency(item?.orderLine?.unitPrice?.gross?.currency)}${addCommasToNumber(item?.orderLine?.unitPrice?.gross?.amount)}`} </td>
                                                        )}

                                                        <td>{item?.orderLine?.quantity}</td>

                                                        <td className="relative">
                                                            <input
                                                                type="number"
                                                                value={quantities[item?.id]}
                                                                disabled={setTotalAmountCalc(item)}
                                                                onChange={(e) => handleQuantityChange(item?.id, Math.max(0, Number(e.target.value)))}
                                                                min="0"
                                                                max={item?.quantity}
                                                                className="form-input pr-8"
                                                            />
                                                            <span className="absolute right-8  top-[21px] transform items-center">/ {item?.quantity}</span>
                                                        </td>
                                                        <td>
                                                            {item?.unitPrice ? (
                                                                <td>{`${formatCurrency(item?.unitPrice?.gross?.currency)}${addCommasToNumber(
                                                                    (quantities[item?.id || item?.orderLine?.id] || 0) * item?.unitPrice?.gross?.amount
                                                                )}`}</td>
                                                            ) : (
                                                                <td>{`${formatCurrency(item?.orderLine?.unitPrice?.gross?.currency)}${addCommasToNumber(
                                                                    (quantities[item?.id || item?.orderLine?.id] || 0) * item?.orderLine?.unitPrice?.gross?.amount
                                                                )}`}</td>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {!isDisableLines() && (
                                        <div>
                                            <div className="mt-4 flex justify-end gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={applyAllProduct}
                                                    disabled={isDisableLines()}
                                                    onChange={(e) => {
                                                        applyAllProducts(e.target.checked);
                                                    }}
                                                    className="form-checkbox border-white-light dark:border-white-dark ltr:mr-0 rtl:ml-0"
                                                />
                                                <label
                                                    className="text-md cursor-pointer font-semibold dark:text-white-light"
                                                    onClick={() => {
                                                        applyAllProducts(!applyAllProduct);
                                                    }}
                                                >
                                                    Apply All Products
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="">
                                <div className="mb-4  mt-4 bg-[#fbfbfb] text-lg font-medium dark:bg-[#121c2c]">Refunded Amount</div>
                                <div className="flex items-center gap-4">
                                    {!disableLines &&
                                        refundAmtType?.map((item) => (
                                            <div key={item} className="flex gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItem === item}
                                                    onChange={() => {
                                                        setSelectedItem(item);
                                                    }}
                                                    className="form-checkbox border-white-light dark:border-white-dark ltr:mr-0 rtl:ml-0"
                                                />
                                                <label
                                                    className="text-md cursor-pointer font-semibold dark:text-white-light"
                                                    onClick={() => {
                                                        setSelectedItem(item);
                                                    }}
                                                >
                                                    {item}
                                                </label>
                                            </div>
                                        ))}
                                </div>
                                {selectedItem == 'Manual Amount' && (
                                    <div>
                                        <div className=" mt-4 bg-[#fbfbfb] text-sm font-medium dark:bg-[#121c2c]">Manual Amount</div>
                                        <input
                                            type="text"
                                            value={manualAmount}
                                            onChange={(e) => {
                                                if (e.target.value > maxRefundAmt) {
                                                    setManualAmtError('Amount cannot be bigger than max refund');
                                                } else {
                                                    setManualAmount(e.target.value);
                                                    setManualAmtError('');
                                                    // setTotalAmount(e.target.value);
                                                }
                                            }}
                                            className="form-input w-[200px]"
                                        />
                                        {manualAmtError && <ErrorMessage message={manualAmtError} />}
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                                <div className="mb-8 sm:mb-0"></div>
                                <div className=" flex flex-col gap-5">
                                    <div className="flex items-center justify-between ">
                                        <div>SubTotal</div>
                                        <div>{`${formatCurrency(refundData?.total?.gross?.currency)}${addCommasToNumber(
                                            refundData?.total?.gross?.amount - refundData?.shippingPrice?.gross?.amount
                                        )}`}</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>Shipping Rate</div>
                                        <div>{`${formatCurrency(refundData?.shippingPrice?.gross?.currency)}${addCommasToNumber(refundData?.shippingPrice?.gross?.amount)}`}</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>Total</div>
                                        <div>{`${formatCurrency(refundData?.total?.gross?.currency)}${addCommasToNumber(refundData?.total?.gross?.amount)}`}</div>
                                    </div>

                                    <div className=" flex items-center justify-between gap-3">
                                        <div> Previously refunded</div>
                                        <div>{`${formatCurrency(refundData?.total?.gross?.currency)}${addCommasToNumber(orderData?.totalRefunded?.amount)}`}</div>
                                    </div>

                                    <div className=" flex items-center justify-between gap-3 font-semibold">
                                        <div>Maximum Refund Amount</div>
                                        <div>
                                            <div>{`${formatCurrency(orderData?.totalCaptured?.currency)}${addCommasToNumber(maxRefundCalculation())}`}</div>
                                        </div>
                                    </div>

                                    {/* <div className="mt-3 flex items-center justify-between gap-3 font-semibold">
                                        <div>Total Refund Amount</div>
                                        <div>
                                            <div>{`${formatCurrency(refundData?.totalCaptured?.currency)}${addCommasToNumber(totalAmount) || addCommasToNumber(0)}`}</div>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-end">
                            <button type="button" className="btn btn-outline-danger gap-2" onClick={() => setIsOpenRefund(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => handleRefund()}>
                                {refundLoading ? <IconLoader /> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                )}
            />
        </>
    );
};

export default PrivateRouter(Editorder);
