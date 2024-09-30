import React, { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import {
    ADD_COUPEN,
    ADD_NEW_LINE,
    COUNTRY_LIST,
    CREATE_DRAFT_ORDER,
    CREATE_NOTES,
    CUSTOMER_ADDRESS,
    CUSTOMER_LIST,
    DELETE_LINE,
    DELETE_NOTES,
    FILTER_PRODUCT_LIST,
    GET_ORDER_DETAILS,
    SHIPPING_COST_UPDATE,
    STATES_LIST,
    UPDATE_COUPEN,
    UPDATE_LINE,
} from '@/query/product';
import { Loader } from '@mantine/core';
import * as Yup from 'yup';
import { useMutation } from '@apollo/client';
import { isEmptyObject, sampleParams, showDeleteAlert } from '@/utils/functions';
import Swal from 'sweetalert2';
import IconPencil from '@/components/Icon/IconPencil';
import IconX from '@/components/Icon/IconX';
import { Dialog, Transition } from '@headlessui/react';
import IconEdit from '@/components/Icon/IconEdit';
import Modal from '@/components/Modal';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import Select from 'react-select';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';

const AddOrder = () => {
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

    const router = useRouter();

    const [quantity, setQuantity] = useState(0);

    const [customerData, setCustomerData] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [isOpenCoupen, setIsOpenCoupen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [countryList, setCountryList] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState([]);
    const [draftOrderId, setDraftOrderId] = useState([]);
    const [selectedOption, setSelectedOption] = useState('percentage');

    //List data
    const [data, setData] = useState<any>([]);
    const [stateList, setStateList] = useState([]);

    const [btnOpen, setbtnOpen] = useState(false);

    //For fee
    const [feeOpen, setFeeOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState(0);
    const [orderData, setOrderData] = useState<any>(0);
    const [feeIsEdit, setFeeIsEdit] = useState(false);

    // For product
    const [addProductOpen, setAddProductOpen] = useState(false);
    const [productIsEdit, setProductIsEdit] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(0);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [percentcoupenValue, setPercentCoupenValue] = useState('');
    const [fixedcoupenValue, setFixedCoupenValue] = useState('');

    const [productList, setProductList] = useState<any>([]);
    const [productListData, setProductListData] = useState([]);

    //For shipping
    const [shippingOpen, setShippingOpen] = useState(false);
    const [shippingPrice, setShippingPrice] = useState(0);
    const [shippingIsEdit, setShippingIsEdit] = useState(false);

    const [showBillingInputs, setShowBillingInputs] = useState(false);
    const [showShippingInputs, setShowShippingInputs] = useState(false);
    const [selectedItems, setSelectedItems] = useState<any>({});

    const [formData, setFormData] = useState<any>(initialValues);
    const [errors, setErrors] = useState<any>({});

    const [addNotes] = useMutation(CREATE_NOTES);
    const [deleteNotes] = useMutation(DELETE_NOTES);
    const [newAddLine] = useMutation(ADD_NEW_LINE);
    const [updateLine] = useMutation(UPDATE_LINE);

    const [addCoupenAmt] = useMutation(ADD_COUPEN);
    const [updateCoupenAmt] = useMutation(UPDATE_COUPEN);

    const [updateShipping] = useMutation(SHIPPING_COST_UPDATE);
    const [removeLine] = useMutation(DELETE_LINE);

    const { data: countryData } = useQuery(COUNTRY_LIST);

    const { data: productData } = useQuery(FILTER_PRODUCT_LIST, {
        variables: {
            after: null,
            first: 20,
            query: '',
            channel: 'india-channel',
            address: {
                country: 'IN',
            },
            isPublished: true,
            stockAvailability: 'IN_STOCK',
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
    });

    const [draftOrder] = useMutation(CREATE_DRAFT_ORDER);

    const { data: stateData } = useQuery(STATES_LIST, {
        variables: { code: formData.billing.country },
    });

    const { data: shippingProvider } = useQuery(CUSTOMER_LIST, {
        variables: {
            after: null,
            first: 50,
            query: '',
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
    });

    const { data: customerAddress, refetch: addressRefetch } = useQuery(CUSTOMER_ADDRESS, {
        variables: {
            id: selectedCustomer,
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
    });

    const { data: productDetails, refetch } = useQuery(GET_ORDER_DETAILS, {
        variables: {
            id: draftOrderId,
            isStaffUser: true,
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
    });

    useEffect(() => {
        getCountryList();
    }, [countryData]);

    useEffect(() => {
        setDiscountValue();
    }, [productDetails, percentcoupenValue, fixedcoupenValue]);

    useEffect(() => {
        createDraftOrder();
    }, []);

    useEffect(() => {
        getProductDetails();
    }, [productDetails]);

    useEffect(() => {
        getProductDetails();
    }, []);

    useEffect(() => {
        addressRefetch();
    }, [selectedCustomer]);

    useEffect(() => {
        getProductsList();
    }, [productData]);

    useEffect(() => {
        getCustomer();
    }, [shippingProvider]);

    useEffect(() => {
        if (formData.billing.country) {
            setStateList(stateData?.addressValidationRules?.countryAreaChoices);
        }
    }, [stateData]);

    const getProductDetails = () => {
        setLoading(true);
        if (productDetails) {
            if (productDetails && productDetails?.order && productDetails?.order?.lines?.length > 0) {
                const list = productDetails?.order?.lines;
                setProductListData(list);
                setLoading(false);
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const createDraftOrder = async () => {
        try {
            const { data } = await draftOrder({
                variables: {
                    input: {
                        channelId: 'Q2hhbm5lbDoy',
                    },
                },
            });
            console.log('data: ', data);
            setDraftOrderId(data?.draftOrderCreate?.order?.id);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getProductsList = () => {
        setLoading(true);
        if (productData) {
            if (productData && productData?.search && productData?.search?.edges?.length > 0) {
                const list = productData?.search?.edges?.map((item: any) => item.node);

                const dropdown: any = list.map((item: any) => ({ value: item.id, label: item.name }));
                setProductList(list);
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

    const getCustomer = () => {
        setLoading(true);
        if (shippingProvider) {
            if (shippingProvider && shippingProvider?.search?.edges?.length > 0) {
                const dropdownData = shippingProvider?.search?.edges?.map((item: any) => ({
                    value: item.node?.id,
                    label: `${item.node?.firstName} -${item.node?.lastName}`,
                }));
                setCustomerData(dropdownData);
                setLoading(false);
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const BillingInputs = () => {
        setShowBillingInputs(!showBillingInputs);
    };

    const ShippingInputs = () => {
        setShowShippingInputs(!showShippingInputs);
    };

    const [items, setItems] = useState<any>([]);

    const addItem = () => {
        let maxId = 0;
        maxId = items?.length ? items.reduce((max: number, character: any) => (character.id > max ? character.id : max), items[0].id) : 0;

        setItems([
            ...items,
            {
                id: maxId + 1,
                title: '',
                description: '',
                rate: 0,
                quantity: 0,
                amount: 0,
            },
        ]);
    };

    const removeItem = (item: any) => {
        showDeleteAlert(
            async () => {
                const data = await removeLine({
                    variables: {
                        id: item.id,
                    },
                });
                console.log('data: ', data);
                refetch();

                // setData(data.filter((data: any) => data.id !== item.id));

                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your item List is safe :)', 'error');
            }
        );

        // setItems(items.filter((d: any) => d.id !== item.id));
    };

    const handleUpdateShipping = async () => {
        try {
            console.log('draftOrderId: ', draftOrderId);

            const data = await updateShipping({
                variables: {
                    id: draftOrderId,
                    input: {
                        shippingMethod: 'U2hpcHBpbmdNZXRob2Q6Mw==',
                    },
                },
            });
            console.log('data: ', data);
            refetch();
            setShippingOpen(false);
            setShippingPrice(0);
            setShippingIsEdit(false);
        } catch (error) {
            console.log('error: ', error);
        }
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
            pincode: Yup.string().required('Postal code is required'),
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
            pincode: Yup.string().required('Postal code is required'),
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

    const setBillingAddress = async () => {
        console.log('val: ', customerAddress);
        try {
            if (selectedCustomer != '' && selectedCustomer != undefined) {
                let billing = {};
                if (customerAddress && customerAddress?.user) {
                    if (customerAddress?.user?.defaultBillingAddress) {
                        const billingId = customerAddress?.user?.defaultBillingAddress?.id;
                        if (customerAddress?.user?.addresses?.length > 0) {
                            const filter = customerAddress?.user?.addresses?.find((item: any) => item.id == billingId);
                            billing = {
                                firstName: filter.firstName,
                                lastName: filter.lastName,
                                company: filter?.companyName,
                                address_1: filter?.streetAddress1,
                                address_2: filter?.streetAddress2,
                                city: filter?.city,
                                state: filter?.state?.code,
                                country: filter?.country?.code,
                                email: filter.email,
                                phone: filter.phone,
                                paymentMethod: '',
                                transactionId: '',
                                countryArea: '',
                                pincode: filter.postalCode,
                            };
                        }
                    }

                    setFormData({
                        ...formData,
                        billing,
                    });
                }
            } else {
                alert('Please choose customer');
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const setShippingAddress = async () => {
        try {
            if (selectedCustomer != '' && selectedCustomer != undefined) {
                let shipping = {};
                if (customerAddress?.user?.defaultShippingAddress) {
                    const billingId = customerAddress?.user?.defaultShippingAddress?.id;
                    if (customerAddress?.user?.addresses?.length > 0) {
                        const filter = customerAddress?.user?.addresses?.find((item: any) => item.id == billingId);

                        shipping = {
                            firstName: filter.firstName,
                            lastName: filter.lastName,
                            company: filter?.companyName,
                            address_1: filter?.streetAddress1,
                            address_2: filter?.streetAddress2,
                            city: filter?.city,
                            state: '',
                            country: filter?.country?.code,
                            email: filter.email,
                            phone: filter.phone,
                            paymentMethod: '',
                            transactionId: '',
                            countryArea: '',
                            pincode: filter.postalCode,
                        };
                    }
                    setShowBillingInputs(true);
                    setShowShippingInputs(true);
                }

                setFormData({
                    ...formData,
                    shipping,
                });
            } else {
                alert('Please choose customer');
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };
    const setBillingToShippingAddress = async () => {
        try {
            setFormData({
                ...formData,
                shipping: {
                    firstName: formData?.billing.firstName,
                    lastName: formData?.billing.lastName,
                    company: formData?.billing.company,
                    address_1: formData?.billing.address_1,
                    address_2: formData?.billing.address_2,
                    city: formData?.billing.city,
                    state: formData?.billing.state,
                    country: formData?.billing.country,
                    email: formData?.billing.email,
                    phone: formData?.billing.phone,
                    paymentMethod: formData?.billing.paymentMethod,
                    transactionId: formData?.billing.transactionId,
                    countryArea: formData?.billing.countryArea,
                    pincode: formData?.billing.pincode,
                },
            });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleSelect: any = (heading: any, subHeading: any) => {
        if (subHeading) {
            setSelectedItems((prevState: any) => ({
                ...prevState,
                [heading]: {
                    ...prevState[heading],
                    [subHeading]: !prevState[heading]?.[subHeading],
                },
            }));
        } else {
            setSelectedItems((prevState: any) => {
                const newState: any = { ...prevState };
                newState[heading] = Object.fromEntries(productList.find((item: any) => item.name === heading).variants.map(({ name }: any) => [name, !prevState[heading]?.[name]]));
                return newState;
            });
        }
    };

    const handleHeadingSelect = (heading: any) => {
        const isHeadingChecked = selectedItems[heading] && Object.values(selectedItems[heading]).every((value) => value);
        if (isHeadingChecked) {
            setSelectedItems((prevState: any) => {
                const newState = { ...prevState };
                newState[heading] = Object.fromEntries(Object.entries(prevState[heading]).map(([name]) => [name, false]));
                return newState;
            });
        } else {
            handleSelect(heading);
        }
    };

    const handleSubHeadingSelect = (heading: any, subHeading: any) => {
        handleSelect(heading, subHeading);
    };

    const addProducts = async () => {
        try {
            const selectedSubheadingIds: any[] = [];
            productList.forEach(({ name, variants }: any) => {
                if (selectedItems[name]) {
                    variants?.forEach(({ name: variantName, id }: any) => {
                        if (selectedItems[name][variantName]) {
                            selectedSubheadingIds.push(id);
                        }
                    });
                }
            });
            const input = selectedSubheadingIds?.map((item) => ({
                quantity: 1,
                variantId: item,
            }));

            const data = await newAddLine({
                variables: {
                    id: draftOrderId,
                    input,
                },
            });
            console.log('data: ', data);
            setAddProductOpen(false);
            // setSelectedItems([]);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const updateQuantity = async () => {
        console.log('updateQuantity: ');
        try {
            const res = await updateLine({
                variables: {
                    id: selectedProductId,
                    input: {
                        quantity: quantity,
                    },
                },
            });
            refetch();
            setAddProductOpen(false);

            console.log('data: ', res);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const addDiscount = async () => {
        try {
            console.log('selectedOption: ', selectedOption);
            console.log('percentcoupenValue: ', percentcoupenValue);
            console.log('fixedcoupenValue: ', fixedcoupenValue);

            const res = await addCoupenAmt({
                variables: {
                    orderId: draftOrderId,
                    input: {
                        reason: '',
                        value: selectedOption == 'percentage' ? percentcoupenValue : fixedcoupenValue,
                        valueType: selectedOption.toUpperCase(),
                    },
                },
            });
            console.log('res: ', res);
            refetch();
            setIsOpenCoupen(false);
            setFixedCoupenValue('');
            setPercentCoupenValue('');
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const updateDiscount = async () => {
        try {
            const res = await updateCoupenAmt({
                variables: {
                    discountId: productDetails?.order?.discounts[0]?.id,

                    input: {
                        reason: '',
                        value: selectedOption == 'percentage' ? percentcoupenValue : fixedcoupenValue,
                        valueType: selectedOption.toUpperCase(),
                    },
                },
            });
            console.log('res: ', res);
            refetch();
            setIsOpenCoupen(false);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const setDiscountValue = () => {
        if (productDetails?.order?.discounts?.length > 0) {
            setSelectedOption(productDetails?.order?.discounts[0]?.calculationMode.toLowerCase());
            if (productDetails?.order?.discounts[0]?.calculationMode == 'PERCENTAGE') {
                setPercentCoupenValue(productDetails?.order?.discounts[0]?.value.toString());
            } else {
                setFixedCoupenValue(productDetails?.order?.discounts[0]?.value);
            }
        }
    };

    const SubmittedForm = Yup.object().shape({
        message: Yup.string().required('Please fill the message'),
    });

    const onSubmit = async (record: any, { resetForm }: any) => {
        try {
            const aaa = { input: { message: record.message }, orderId: draftOrderId, private_note: record.mail };

            const data = await addNotes({
                variables: { input: { message: record.message }, orderId: draftOrderId, private_note: record.mail },
            });

            const newData = { ...orderData, events: data?.data?.orderNoteAdd?.order?.events };
            setOrderData(newData);
            resetForm();
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const removeNotes = (item: any) => {
        // showDeleteAlert(
        //     async () => {
        //         await deleteNotes({
        //             variables: { noteId: item.id },
        //         });
        //         const filter = state.notesList?.filter((data: any) => data.id !== item.id);
        //         setState({ notesList: filter });
        //         Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
        //     },
        //     () => {
        //         Swal.fire('Cancelled', 'Your Notes List is safe :)', 'error');
        //     }
        // );
    };

    return (
        <>
            {loading ? (
                <Loader />
            ) : (
                <>
                    <div className="panel mb-5 flex items-center justify-between gap-3 p-5 ">
                        <h3 className="text-lg font-semibold dark:text-white-light">Add new order</h3>
                        {/* <button type="button" className="btn btn-primary">
                            Add Order
                        </button> */}
                    </div>
                    <div className="grid grid-cols-12 gap-5 ">
                        <div className=" col-span-9 mb-5  ">
                            <div className="panel mb-5 p-5">
                                <div>
                                    <h3 className="text-lg font-semibold">Order #13754 Details</h3>
                                    <p className=" pt-1 text-gray-500">Payment via Cash on delivery. Customer IP: 122.178.161.16</p>
                                </div>
                                <div className="mt-8">
                                    <h5 className="mb-3 text-lg font-semibold">General</h5>
                                    <div className="grid grid-cols-12 gap-5">
                                        {/* <div className="col-span-4">
                                            <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                                Date created:
                                            </label>

                                            <input type="datetime-local" id="dateTimeCreated" name="dateTimeCreated" className="form-input" required />
                                        </div>

                                        <div className="col-span-4">
                                            <label htmlFor="regularPrice" className="block pr-2 text-sm font-medium text-gray-700">
                                                Status:
                                            </label>
                                            <select className="form-select">
                                                <option value="processing">Processing</option>
                                                <option value="onhold">On Hold</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div> */}

                                        <div className="col-span-4">
                                            <div className=" flex  items-center justify-between">
                                                <label htmlFor="status" className="block pr-2 text-sm font-medium text-gray-700">
                                                    Customer:
                                                </label>
                                                {/* <div>
                                                    <p>
                                                        <a href="#" className="mr-2 text-primary">
                                                            Profile
                                                        </a>
                                                        /
                                                        <a href="#" className="ml-2 text-primary">
                                                            View Other Orders
                                                        </a>
                                                    </p>
                                                </div> */}
                                            </div>

                                            {/* <input list="statusOptions" name="status" className="form-select" /> */}
                                            <select
                                                className="form-select"
                                                value={selectedCustomer}
                                                onChange={(val) => {
                                                    const selectedCustomerId: any = val.target.value;
                                                    setSelectedCustomer(selectedCustomerId);
                                                    addressRefetch();
                                                    setShowBillingInputs(true);
                                                    setShowShippingInputs(true);
                                                    // setBillingAddress(val);
                                                    // setShippingAddress(val);
                                                }}
                                            >
                                                <option value="" disabled selected>
                                                    Select a customer
                                                </option>
                                                {customerData?.map((item: any) => (
                                                    <option key={item?.value} value={item?.value}>
                                                        {item?.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* {customerData?.map((item: any) => (
                                                    <option value="processing">{item?.node?.name}</option>
                                                ))} */}
                                            {/* <datalist id="statusOptions">
                                                <option value="processing">processing</option>
                                                <option value="onhold">onhold</option>
                                                <option value="completed">completed</option>
                                            </datalist> */}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-12 gap-5">
                                    <div className="col-span-6 mr-5">
                                        <div className="flex w-52 items-center justify-between">
                                            <h5 className="mb-3 text-lg font-semibold">Billing</h5>
                                            <button type="button" onClick={() => BillingInputs()}>
                                                <IconPencil className="cursor-pointer" />
                                            </button>
                                        </div>
                                        {showBillingInputs === false ? (
                                            <>
                                                {isEmptyObject(formData.billing) ? (
                                                    <>
                                                        <p>Address :</p>
                                                        <p>No billing address set. </p>
                                                    </>
                                                ) : (
                                                    <div className="mt-3 text-gray-500">
                                                        <p>{`${formData?.billing?.firstName} ${formData?.billing?.lastName}`}</p>
                                                        <p>{formData?.billing?.company}</p>
                                                        <p>
                                                            {formData?.billing?.address_1}
                                                            <br />
                                                            {formData?.billing?.address_2}
                                                            <br /> {formData?.billing?.city}
                                                            <br /> {formData?.billing?.state}
                                                            <br /> {selectedCountry}
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
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <button className="text-primary underline" onClick={() => setBillingAddress()}>
                                                    Load billing address
                                                </button>

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
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                const selectedCountryCode = e.target.value;
                                                                const selectedCountry: any = countryList.find((country: any) => country.code === selectedCountryCode);
                                                                if (selectedCountry) {
                                                                    setSelectedCountry(selectedCountry.country);
                                                                }
                                                            }}
                                                            // value={selectedCountry}
                                                            // onChange={(e) => getStateList(e.target.value)}
                                                        >
                                                            <option key={''} disabled value={'Select country'} />

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
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                            }}
                                                        >
                                                            <option key={''} disabled value={'Select state'} />

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

                                                <div className="mt-5 grid grid-cols-12 gap-3">
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
                                                </div>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-12">
                                                        <label htmlFor="transaction" className=" text-sm font-medium text-gray-700">
                                                            Transaction ID
                                                        </label>
                                                        <input type="text" className="form-input" name="billing.transactionId" value={formData.billing.transactionId} onChange={handleChange} />

                                                        {/* <input type="text" id="billingtransaction" name="billingtransaction" className="form-input" required /> */}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="col-span-6 mr-5">
                                        <div className="flex w-52 items-center justify-between">
                                            <h5 className="mb-3 text-lg font-semibold">Shipping</h5>
                                            <button type="button" onClick={() => ShippingInputs()}>
                                                <IconPencil />
                                            </button>
                                        </div>

                                        {showShippingInputs === false ? (
                                            <>
                                                {isEmptyObject(formData.shipping) ? (
                                                    <>
                                                        <p>Address :</p>
                                                        <p>No shipping address set. </p>
                                                    </>
                                                ) : (
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
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => setShippingAddress()} className="mr-3 text-primary underline">
                                                    Load Shipping address
                                                </button>
                                                <button onClick={() => setBillingToShippingAddress()} className="mr-3 text-primary underline">
                                                    Copy Billing address
                                                </button>

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

                                                <div className="mt-5 grid grid-cols-12 gap-3">
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

                                                        {/* <input type="text" id="billingtransaction" name="billingtransaction" className="form-input" required /> */}
                                                    </div>
                                                </div>
                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-12">
                                                        <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                                                            Customer Provided note:
                                                        </label>
                                                        <textarea className="form-input" name="note" id="note" cols={30 as number} rows={2 as number}></textarea>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="panel p-5">
                                <div className="table-responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>SKU</th>

                                                <th className="w-1">Cost</th>
                                                <th className="w-1">Qty</th>
                                                <th>Total</th>
                                                {formData?.billing?.state !== '' && (
                                                    <>
                                                        {formData?.billing?.state == 'Tamil Nadu' ? (
                                                            <>
                                                                <th>SGST</th>
                                                                <th>CSGT</th>
                                                            </>
                                                        ) : (
                                                            <th>IGST</th>
                                                        )}
                                                    </>
                                                )}
                                                <th>Action</th>

                                                <th className="w-1"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productListData?.map((item: any, index: any) => (
                                                <tr className="align-top" key={index}>
                                                    <td>{item?.productName}</td>
                                                    <td>{item?.productSku}</td>
                                                    <td>
                                                        {item?.totalPrice?.gross?.currency} {item?.totalPrice?.gross?.amount}
                                                    </td>
                                                    <td>{item?.quantity}</td>

                                                    <td>
                                                        {item?.totalPrice?.gross?.currency} {item?.totalPrice?.gross?.amount}
                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedProductId(item.id);
                                                                setQuantity(item.quantity);
                                                                setAddProductOpen(true);
                                                                setProductIsEdit(true);
                                                                setSelectedProduct(index);
                                                            }}
                                                        >
                                                            <IconPencil className="mr-3 h-5 w-5" />
                                                        </button>
                                                        <button type="button" onClick={() => removeItem(item)}>
                                                            <IconTrashLines className="h-5 w-5" />
                                                        </button>
                                                    </td>
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
                                            <div>
                                                {productDetails?.order?.subtotal?.gross?.currency} {productDetails?.order?.subtotal?.gross?.amount}
                                            </div>
                                        </div>
                                        {/* <div className="mt-4 flex items-center justify-between">
                                            <div>Tax(%)</div>
                                            <div>0%</div>
                                        </div> */}
                                        {productDetails?.order?.shippingPrice?.gross?.amount > 0 && (
                                            <div className="mt-4 flex items-center justify-between">
                                                <div>Shipping Rate</div>
                                                <div>
                                                    {productDetails?.order?.shippingPrice?.gross?.currency} {productDetails?.order?.shippingPrice?.gross?.amount}
                                                </div>
                                            </div>
                                        )}
                                        {productDetails?.order?.discounts?.length > 0 && (
                                            <div className="mt-4 flex items-center justify-between">
                                                <div>Discount</div>
                                                <div>{productDetails?.order?.discounts[0]?.value}</div>
                                            </div>
                                        )}
                                        <div className="mt-4 flex items-center justify-between font-semibold">
                                            <div>Total</div>
                                            <div>
                                                {productDetails?.order?.total?.gross?.currency} {productDetails?.order?.total?.gross?.amount}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-between  gap-2 border-t border-gray-200 pt-5">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() => {
                                                setQuantity(0);
                                                setProductIsEdit(false);
                                                setAddProductOpen(true);
                                            }}
                                        >
                                            Add Product
                                        </button>
                                        <button type="button" className="btn btn-outline-primary" onClick={() => setIsOpenCoupen(true)}>
                                            Apply coupon
                                        </button>
                                    </div>
                                    <div>
                                        <button type="button" className="btn btn-primary">
                                            Recalculate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className=" col-span-3 mb-5  ">
                            <div className="panel mb-5 p-5">
                                <div className="mb-5 border-b border-gray-200 pb-2 ">
                                    <h3 className="text-lg font-semibold">Order Actions</h3>
                                </div>
                                <div>
                                    <select className="form-select mr-3">
                                        <option value="">Choose An Action</option>
                                        <option value="Email Invoice">Email Invoice</option>
                                    </select>
                                </div>
                                <div className="mt-5 border-t border-gray-200 pb-2 ">
                                    <div className="flex flex-row-reverse items-center justify-between pt-3">
                                        {/* <a href="#" className="text-danger underline">
                                            Move To Trash
                                        </a> */}
                                        <button className="btn btn-outline-primary">Create</button>
                                    </div>
                                </div>
                            </div>
                            <div className="panel p-5">
                                <div className="mb-5 border-b border-gray-200 pb-2 ">
                                    <h3 className="text-lg font-semibold">Order Notes</h3>
                                </div>
                                <div className="mb-5 border-b border-gray-200 pb-2 ">
                                    {orderData?.events?.length > 0 ? (
                                        orderData?.events?.map((data: any, index: number) => (
                                            <div className="mb-5" key={index}>
                                                <div className="text-gray-500">
                                                    <div className=" mb-2 bg-gray-100  p-3 ">{data?.message}</div>
                                                    <span className=" mr-1 border-b border-dotted border-gray-500">{moment(data?.date).format('MMMM DD, YYYY [at] HH:mm a')}</span>
                                                    {data?.user && data?.user?.email && `by ${data.user.email}`}
                                                    <span className="ml-2 cursor-pointer text-danger" onClick={() => removeNotes(data)}>
                                                        Delete note
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <span className=" mr-1 border-b border-dotted border-gray-500">No data found</span>
                                    )}

                                    <div className="mb-5">
                                        <div className="text-gray-500">
                                            <div className="mb-2 bg-blue-200 p-3">Hi</div>
                                            <span className="mr-1 border-b border-dotted border-gray-500">April 20, 2024 at 11:26 am</span>- by prderepteamuser -{' '}
                                            <span className="ml-2 cursor-pointer text-danger ">Delete note</span>
                                        </div>
                                    </div>

                                    <div className="mb-5">
                                        <div className="text-gray-500">
                                            <div className="mb-2 bg-pink-200 p-3">Payment to be made upon delivery. Order status changed from Pending payment to Processing.</div>
                                            <span className="mr-1 border-b border-dotted border-gray-500">April 20, 2024 at 11:26 am</span>- by prderepteamuser -{' '}
                                            <span className="ml-2 cursor-pointer text-danger ">Delete note</span>
                                        </div>
                                    </div>
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
                                                    Add
                                                </button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                    <Modal
                        edit={productIsEdit}
                        addHeader={'Add Product'}
                        updateHeader={'Update Product'}
                        open={addProductOpen}
                        close={() => setAddProductOpen(false)}
                        renderComponent={() => (
                            <>
                                {productIsEdit ? (
                                    <div className="p-5">
                                        <div className="p-5">
                                            <input type="number" className="form-input" value={quantity} onChange={(e: any) => setQuantity(e.target.value)} />
                                        </div>
                                        <div className="flex justify-end gap-5">
                                            <button
                                                onClick={() => {
                                                    setSelectedItems([]);
                                                    setAddProductOpen(false);
                                                }}
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
                                ) : (
                                    <div className="overflow-scroll p-5">
                                        {productList.map(({ name, variants }: any) => (
                                            <div key={name}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        className="form-checkbox"
                                                        checked={selectedItems[name] && Object.values(selectedItems[name])?.every((value) => value)}
                                                        onChange={() => handleHeadingSelect(name)}
                                                    />
                                                    {name}
                                                </label>
                                                <ul>
                                                    {variants?.map(({ name: variantName }: any) => (
                                                        <li key={variantName} style={{ paddingLeft: '10px' }}>
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-checkbox"
                                                                    checked={selectedItems[name]?.[variantName]}
                                                                    onChange={() => handleSubHeadingSelect(name, variantName)}
                                                                />
                                                                {variantName}
                                                            </label>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                        <div className="flex justify-end gap-5">
                                            <button
                                                onClick={() => {
                                                    setSelectedItems([]);
                                                    setAddProductOpen(false);
                                                }}
                                                className="rounded border border-black bg-transparent px-4 py-2 font-semibold text-black hover:border-transparent hover:bg-blue-500 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => addProducts()}
                                                className="rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-500 hover:border-transparent hover:bg-blue-500 hover:text-white"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    />
                    {/* Add Coupen */}
                    <Modal
                        edit={isOpenCoupen}
                        addHeader={'Discount this Order by:'}
                        updateHeader={'Discount this Order by:'}
                        open={isOpenCoupen}
                        close={() => setIsOpenCoupen(false)}
                        renderComponent={() => (
                            <>
                                <div className=" overflow-scroll p-3">
                                    <div className=" items-center justify-center gap-5 ">
                                        <div className=" flex items-center justify-center gap-5">
                                            <div className="flex cursor-pointer gap-3">
                                                <input
                                                    type="radio"
                                                    value="percentage"
                                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                    checked={selectedOption === 'percentage'}
                                                    onChange={(e) => setSelectedOption(e.target.value)}
                                                />
                                                <span onClick={() => setSelectedOption('percentage')}>Percentage</span>
                                            </div>
                                            <div className="flex cursor-pointer gap-3">
                                                <input
                                                    type="radio"
                                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                    value="fixed"
                                                    checked={selectedOption === 'fixed'}
                                                    onChange={(e) => setSelectedOption(e.target.value)}
                                                />
                                                <span onClick={() => setSelectedOption('fixed')}>Fixed Amount</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            {selectedOption === 'percentage' ? (
                                                <input type="number" className="form-input mb-5 mt-4" value={percentcoupenValue} onChange={(e) => setPercentCoupenValue(e.target.value)} />
                                            ) : (
                                                <input type="number" className="form-input mb-5 mt-4" value={fixedcoupenValue} onChange={(e) => setFixedCoupenValue(e.target.value)} />
                                            )}
                                            <span>{selectedOption === 'percentage' ? '%' : 'INR'}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-5">
                                        <button className="rounded border border-black bg-transparent px-4 py-2 font-semibold text-black hover:border-transparent hover:bg-blue-500 hover:text-white">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (productDetails?.order?.discounts?.length > 0) {
                                                    updateDiscount();
                                                } else {
                                                    addDiscount();
                                                }
                                            }}
                                            className="rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-500 hover:border-transparent hover:bg-blue-500 hover:text-white"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    />

                    <Modal
                        addHeader={'Add Shipping'}
                        open={shippingOpen}
                        close={() => setShippingOpen(false)}
                        renderComponent={() => (
                            <div className="p-5">
                                <div className="">
                                    <div className="mb-3  bg-[#fbfbfb] text-sm  font-medium dark:bg-[#121c2c]">{'Enter a fixed amount or percentage to apply as a Shipping.'}</div>

                                    <input
                                        type="number"
                                        className="form-input w-full"
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
                                    <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => handleUpdateShipping()}>
                                        Update Shipping
                                    </button>
                                </div>
                            </div>
                        )}
                    />
                </>
            )}
        </>
    );
};

export default AddOrder;
