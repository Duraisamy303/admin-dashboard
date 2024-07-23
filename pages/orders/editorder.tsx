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
            address_2: '',
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
            address_2: '',
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

    const [lines, setLines] = useState([]);
    const [isGiftWrap, setIsGiftWrap] = useState([]);

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

    const [isUpdateQty, setIsUpdateQty] = useState(false);
    const [productQuantity, setProductQuantity] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');

    const [invoiceDate, setInvoiceDate] = useState('');

    const [isEdited, setIsEdited] = useState<any>({});
    const [fullfillData, setFullfillData] = useState([]);

    const [paymentStatus, setPaymentStatus] = useState('');
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

    //CountryList
    const [countryList, setCountryList] = useState([]);

    const { data: stateData } = useQuery(STATES_LIST, {
        variables: { code: formData.billing.country },
    });

    const [stateList, setStateList] = useState([]);

    const [loading, setLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [isOpenPayslip, setIsOpenPayslip] = useState(false);
    const [slipLoading, setSlipLoading] = useState(false);

    const [slipNumber, setSlipNumber] = useState('');
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
    const [trackingError, setTrackingError] = useState(false);
    const [shippingError, setShippingError] = useState(false);
    const [isGiftCart, setIsGiftCart] = useState(false);

    useEffect(() => {
        getOrderData();
    }, [orderDetails]);

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
                    (item: any) => item.type === 'CONFIRMED' || item.type === 'FULFILLMENT_FULFILLED_ITEMS' || item.type === 'NOTE_ADDED' || item.type === 'ORDER_MARKED_AS_PAID'
                );

                const result = filteredArray?.map((item: any) => {
                    const secondItem: any = NotesMsg.find((i) => i.type === item.type);
                    return {
                        type: item.type,
                        message: item.type === 'NOTE_ADDED' ? item.message : secondItem.message,
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
                setPaymentStatus(orderDetails?.order?.paymentStatus);
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
                    address_2: billing?.streetAddress2,
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
                    address_2: shipping?.streetAddress2,
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

    // const sumOldCurrentBalance = (giftCards: any[]) => {
    //     return giftCards?.reduce((sum: any, card: any) => {
    //         const usedInOrderEvents = card.events.filter((event: any) => event.type === 'USED_IN_ORDER');
    //         const oldCurrentBalanceSum = usedInOrderEvents?.reduce((eventSum: any, event: any) => {
    //             return eventSum + (event.balance.oldCurrentBalance ? event.balance.oldCurrentBalance.amount : 0);
    //         }, 0);
    //         return sum + oldCurrentBalanceSum;
    //     }, 0);
    // };

    const sumOldCurrentBalance = (giftCards) => {
        const balanceMap = giftCards
            .flatMap((giftCard) => giftCard.events)
            .filter((event) => event.type === 'USED_IN_ORDER' && event.balance.oldCurrentBalance)
            .reduce((acc, event) => {
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

    const BillingInputs = () => {
        setShowBillingInputs(!showBillingInputs);
    };

    const ShippingInputs = () => {
        setShowShippingInputs(!showShippingInputs);
    };

    const validationSchema = Yup.object().shape({
        billing: Yup.object().shape({
            firstName: Yup.string().required('First Name is required'),
            lastName: Yup.string().required('Last Name is required'),
            email: Yup.string().required('Email is required'),
            company: Yup.string().required('Company is required'),
            address_1: Yup.string().required('Street address is required'),
            address_2: Yup.string().required('Street address is required'),
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
            address_2: Yup.string().required('Street address is required'),
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
                    setIsOrderOpen(false);
                } else {
                    setOrderStatus('Shipped');
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
            setTransactionLoading(true);
            const res = await markAsPaid({
                variables: {
                    id: id,
                    transactionReference: reference,
                },
            });
            getOrderDetails();
            setIsPaymentOpen(false);
            setTransactionLoading(false);

            Success('Payment status updated');
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

            setIsOpenChannel(false);

            router.push({
                pathname: '/orders/new-order',
                query: { orderId: data?.draftOrderCreate?.order?.id },
            });
        } catch (error) {
            setCurrencyLoading(false);

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
            router.push('/orders/orders');
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

            Success('Payslip updated Successfully');
            setIsOpenPayslip(false);
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
                                        {/* )} */}
                                        {/* <div className="col-span-4">
                                                    <label htmlFor="regularPrice" className="block pr-2 text-sm font-medium text-gray-700">
                                                        Payment Method:
                                                    </label>
                                                    <select
                                                        disabled={paymentStatus == 'FULLY_CHARGED'}
                                                        className="form-select"
                                                        // value={paymentStatus}
                                                        onChange={(e) => {
                                                            const status = e.target.value;
                                                        }}
                                                    >
                                                        <option value="NOT_CHARGET">RazorPay</option>
                                                        <option value="FULLY_CHARGED">COD</option>
                                                    </select>
                                                </div> */}
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
                                                    {formData?.billing?.address_1}
                                                    {formData?.billing?.address_2 && <div>{formData.billing.address_2}</div>}
                                                    <br /> {formData?.billing?.city}
                                                    <br /> {formData?.billing?.state}
                                                    <br /> {formData?.billing?.countryArea}
                                                </p>
                                                {formData?.billing?.email && (
                                                    <>
                                                        <p className="mt-3 font-semibold">Email Address:</p>
                                                        <p>
                                                            <a href="mailto:mail2inducs@gmail.com" className="text-primary underline">
                                                                {formData?.billing?.email}
                                                            </a>
                                                        </p>
                                                    </>
                                                )}
                                                {formData?.billing?.phone && (
                                                    <>
                                                        <p className="mt-3 font-semibold">Phone:</p>
                                                        <p>
                                                            <a href="tel:01803556656" className="text-primary underline">
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
                                                <div className="col-span-6">
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
                                                </div>
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
                                                    {`${formData?.shipping?.address_1} - ${formData?.shipping?.address_2}`}
                                                    <br /> {formData?.shipping?.city}
                                                    <br /> {formData?.shipping?.state}
                                                    <br /> {formData?.shipping?.countryArea}
                                                </p>
                                                {formData?.shipping?.email && (
                                                    <>
                                                        <p className="mt-3 font-semibold">Email Address:</p>
                                                        <p>
                                                            <a href="mailto:mail2inducs@gmail.com" className="text-primary underline">
                                                                {formData?.shipping?.email}
                                                            </a>
                                                        </p>
                                                    </>
                                                )}
                                                {formData?.shipping?.phone && (
                                                    <>
                                                        <p className="mt-3 font-semibold">Phone:</p>
                                                        <p>
                                                            <a href="tel:01803556656" className="text-primary underline">
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
                                                <div className="col-span-6">
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
                                                </div>
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

                                            {/* <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-12">
                                                        <label htmlFor="payments" className=" text-sm font-medium text-gray-700">
                                                            Payment method:
                                                        </label>
                                                        <select
                                                            className="form-select mr-3"
                                                            id="shippingpayments"
                                                            name="shipping.paymentMethod"
                                                            value={formData.shipping.paymentMethod}
                                                            onChange={handleChange}
                                                        >
                                                            <option value="private-note">Private note</option>
                                                            <option value="note-customer">Note to customer</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-12">
                                                        <label htmlFor="transaction" className=" text-sm font-medium text-gray-700">
                                                            Transaction ID
                                                        </label>
                                                        <input type="text" className="form-input" name="shipping.transactionId" value={formData.shipping.transactionId} onChange={handleChange} />

                                                    </div>
                                                </div>
                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-12">
                                                        <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                                                            Customer Provided note:
                                                        </label>
                                                        <textarea className="form-input" name="note" id="note" cols="30" rows="2"></textarea>
                                                    </div>
                                                </div> */}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="text-md">User Email :</div>
                                <div className="text-primary underline">{orderData?.userEmail}</div>
                            </div>
                        </div>
                        <div className="panel p-5">
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Item</th>

                                            <th className="w-1">Cost</th>
                                            <th className="w-1">Qty</th>
                                            <th>Total</th>
                                            {formData?.billing?.state !== '' && formData?.shipping?.state == 'Tamil Nadu' ? (
                                                <>
                                                    <th>SGST</th>
                                                    <th>CSGT</th>
                                                </>
                                            ) : (
                                                <th>IGST</th>
                                            )}
                                            {/* <th>Action</th> */}
                                            <th className="w-1"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lines?.length > 0 &&
                                            lines?.map((item: any, index: any) => (
                                                <tr className="panel align-top" key={index}>
                                                    <td className="flex ">
                                                        <img src={item?.thumbnail?.url} height={50} width={50} alt="Selected" className="object-cover" />
                                                        <div>
                                                            <div className="pl-5">{item?.productName}</div>
                                                            <div className="pl-5">{item?.productSku}</div>
                                                        </div>
                                                    </td>

                                                    <td>{`${formatCurrency(item?.unitPrice?.gross?.currency)}${addCommasToNumber(item?.unitPrice?.gross?.amount)}`} </td>

                                                    {/* <td>
                                                            {formatCurrency(item?.unitPrice?.gross?.currency)}
                                                            {item?.unitPrice?.gross?.amount}
                                                        </td> */}
                                                    <td>
                                                        <div>{item?.quantity}</div>
                                                    </td>
                                                    <td>
                                                        <div> {`${formatCurrency(item?.totalPrice?.gross?.currency)}${addCommasToNumber(item?.totalPrice?.gross?.amount)}`}</div>{' '}
                                                        {/* <div>{`${formatCurrency(item?.totalPrice?.gross?.currency)}${item?.totalPrice?.gross?.amount}`}</div> */}
                                                    </td>
                                                    {formData?.billing?.state !== '' && formData?.shipping?.state == 'Tamil Nadu' ? (
                                                        <>
                                                            <td>
                                                                <div>{`${formatCurrency(orderData?.subtotal?.gross?.currency)}${addCommasToNumber(orderData?.subtotal?.tax?.amount / 2)}`}</div>
                                                            </td>
                                                            <td>
                                                                <div>{`${formatCurrency(orderData?.subtotal?.gross?.currency)}${addCommasToNumber(orderData?.subtotal?.tax?.amount / 2)}`}</div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <td>
                                                            <div>{`${formatCurrency(orderData?.subtotal?.gross?.currency)}${addCommasToNumber(orderData?.subtotal?.tax?.amount)}`}</div>
                                                        </td>
                                                    )}
                                                    {/* <td>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setProductQuantity(item?.quantity);
                                                                    setIsUpdateQty(true);
                                                                    setIsEdited(item);
                                                                    console.log('item: ', item);
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
                                        <div>Subtotal</div>
                                        <div>{`${formatCurrency(orderData?.subtotal?.gross?.currency)}${addCommasToNumber(orderData?.subtotal?.gross?.amount)}`}</div>
                                    </div>
                                    {formData?.billing?.state !== '' &&
                                        (formData?.shipping?.state == 'Tamil Nadu' ? (
                                            <>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <div>SGST</div>
                                                    <div>
                                                        <div>{`${formatCurrency(orderData?.subtotal?.tax?.currency)}${addCommasToNumber(orderData?.subtotal?.tax?.amount / 2)}`}</div>

                                                        {/* {orderData?.subtotal?.tax?.currency} {orderData?.subtotal?.tax?.amount / 2} */}
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <div>CSGT</div>
                                                    <div>
                                                        <div>{`${formatCurrency(orderData?.subtotal?.tax?.currency)}${addCommasToNumber(orderData?.subtotal?.tax?.amount / 2)}`}</div>

                                                        {/* {orderData?.subtotal?.tax?.currency} {orderData?.subtotal?.tax?.amount / 2} */}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="mt-4 flex items-center justify-between">
                                                <div>IGST</div>
                                                <div>
                                                    <div>{`${formatCurrency(orderData?.subtotal?.tax?.currency)}${addCommasToNumber(orderData?.subtotal?.tax?.amount)}`}</div>

                                                    {/* {orderData?.subtotal?.gross?.currency} {orderData?.subtotal?.gross?.amount} */}
                                                </div>
                                            </div>
                                        ))}
                                    {/* <div className="mt-4 flex items-center justify-between">
                                            <div>Tax(%)</div>
                                            <div>{orderData?.total?.tax?.amount}</div>
                                        </div> */}
                                    <div className="mt-4 flex  justify-between">
                                        <div>{orderData?.paymentMethod?.name == 'Cash On delivery' ? 'COD Fee' : 'Shipping Rate'}</div>
                                        <div>
                                            {orderData?.paymentMethod?.name == 'Cash On delivery' ? (
                                                <div className="ml-[94px] items-end">{`${formatCurrency(orderData?.shippingPrice?.gross?.currency)}350.00`}</div>
                                            ) : (
                                                <div className="ml-[94px] items-end">
                                                    {`${formatCurrency(orderData?.shippingPrice?.gross?.currency)}${
                                                        isGiftWrap
                                                            ? `${addCommasToNumber(orderData?.shippingPrice?.gross?.amount) - 50}.00`
                                                            : addCommasToNumber(orderData?.shippingPrice?.gross?.amount)
                                                    }`}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {isGiftWrap && (
                                        <div className="mt-4 flex  justify-between">
                                            <div>Gift Wrap</div>
                                            <div>
                                                <div className="ml-[94px] items-end">{`₹50.00`}</div>
                                            </div>
                                        </div>
                                    )}
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
                                                {orderData?.discounts[0]?.amount?.amount}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-4 flex items-center justify-between font-semibold">
                                        <div>Total</div>
                                        <div>
                                            <div className="ml-[98px] justify-end">{`${formatCurrency(orderData?.total?.gross?.currency)}${addCommasToNumber(orderData?.total?.gross?.amount)}`}</div>

                                            <div className="pl-3 text-sm">
                                                (includes {orderData?.total?.tax?.currency == 'USD' ? '$' : '₹'}
                                                {roundOff(orderData?.total?.tax?.amount)} GST)
                                            </div>
                                        </div>
                                    </div>
                                    {orderData?.paymentStatus == 'FULLY_CHARGED' && (
                                        <div className="mt-4 flex items-center justify-between font-semibold">
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
                                    )}
                                    {/* {orderData?.totalCaptured?.amount !== 0 && (
                                        <div className="mt-4 flex items-center justify-between font-semibold">
                                            <div>Paid Amount</div>
                                            <div>
                                                <div className="pl-3 text-sm">
                                                    {orderData?.totalCaptured?.currency == 'USD' ? '$' : '₹'}
                                                    {roundOff(orderData?.totalCaptured?.amount)}
                                                </div>
                                            </div>
                                        </div>
                                    )} */}
                                </div>
                            </div>
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
                                    <select className="form-select mr-3">
                                        <option value="">Choose An Action</option>
                                        <option value="Email Invoice">Email Invoice</option>
                                    </select>
                                </div>
                                <div className="mt-5 border-t border-gray-200 pb-2 ">
                                    <div className=" pt-3">
                                        {/* <a href="#" className="text-danger underline">
                                            Move To Trash
                                        </a> */}
                                        <button onClick={() => handleSubmit()} className="btn btn-outline-primary">
                                            {updateLoading ? <IconLoader /> : 'Update'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="panel max-h-[810px]  overflow-y-auto p-5">
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

                        <div className="panel max-h-[810px]  overflow-y-auto p-5">
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
                            <div className="flex w-full">
                                <input type="text" className="form-input" placeholder="Reference" value={reference} onChange={(e: any) => setReference(e.target.value)} />
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
                close={() => setIsOpenPayslip(false)}
                renderComponent={() => (
                    <div className="p-5 pb-7">
                        <form className="flex flex-col gap-3">
                            <div className=" w-full">
                                <input type="text" className="form-input" placeholder="Slip Number" value={slipNumber} onChange={(e: any) => setSlipNumber(e.target.value)} />
                            </div>

                            <div className="flex w-full">
                                <input
                                    type="datetime-local"
                                    min={getCurrentDateTime()}
                                    value={moment(slipDate).format('YYYY-MM-DDTHH:mm')}
                                    onChange={(e) => setSlipDate(e.target.value)}
                                    id="dateTimeCreated"
                                    name="dateTimeCreated"
                                    className="form-input"
                                />
                                {/* <input type="text" className="form-input" placeholder="Slip Date" value={slipDate} onChange={(e: any) => slipDate(e.target.value)} /> */}
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <button type="button" className="btn btn-outline-danger gap-2" onClick={() => setIsOpenPayslip(false)}>
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
                                                        <img src={profilePic(item?.thumbnail?.url)} height={80} alt="Selected" className="object-cover" />
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
        </>
    );
};

export default PrivateRouter(Editorder);
