import IconLoader from '@/components/Icon/IconLoader';
import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import Modal from '@/components/Modal';
import {
    ADD_COUPEN,
    ADD_NEW_LINE,
    COUNTRY_LIST,
    CREATE_NOTES,
    CUSTOMER_ADDRESS,
    CUSTOMER_LIST,
    DELETE_LINE,
    DELETE_NOTES,
    FILTER_PRODUCT_LIST,
    FINALIZE_ORDER,
    GET_ORDER_DETAILS,
    PRODUCT_SEARCH,
    REMOVE_DISCOUNT,
    STATES_LIST,
    UPDATE_COUPEN,
    UPDATE_DRAFT_ORDER,
    UPDATE_LINE,
    UPDATE_SHIPPING_COST,
    UPDATE_SHIPPING_COUNTRY,
} from '@/query/product';
import { setPageTitle } from '@/store/themeConfigSlice';
import { productsDropdown, setBilling, setShipping } from '@/utils/commonFunction';
import {
    CountryDropdownData,
    Failure,
    NotesMsg,
    Success,
    UserDropdownData,
    addCommasToNumber,
    billingAddress,
    // checkChannel,
    formatCurrency,
    getUniqueStates,
    isEmptyObject,
    objIsEmpty,
    profilePic,
    roundOff,
    shippingAddress,
    showDeleteAlert,
    useSetState,
} from '@/utils/functions';
import { AddressValidation, billingValidation } from '@/utils/validation';
import { useMutation, useQuery } from '@apollo/client';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import * as Yup from 'yup';
import Select from 'react-select';
import CommonLoader from '../elements/commonLoader';
import useDebounce from '@/utils/useDebounce';
import CustomerSelect from '@/components/CustomerSelect';

const NewOrder = () => {
    const router = useRouter();

    const orderId = router?.query?.orderId;

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Add New Orders'));
    });

    const [state, setState] = useSetState({
        loading: false,
        customerList: [],
        selectedCustomerId: '',
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
        billingAddress: billingAddress,
        shippingAddress: shippingAddress,
        showBillingInputs: false,
        showShippingInputs: false,
        countryList: [],
        stateList: [],
        shippingStateList: [],
        lineList: [],
        isOpenProductAdd: false,
        isOpenProductUpdate: false,
        productList: [],
        editProduct: {},
        isEditProduct: false,
        quantity: '',
        selectedProduct: [],
        isOpenCoupen: false,
        coupenOption: '',
        percentcoupenValue: '',
        fixedCoupenValue: '',
        notesList: [],
        productIsEdit: false,
        addProductOpen: false,
        selectedItems: {},
        updateAddressLoading: false,
        productLoading: false,
        updateProductLoad: false,
        isFreeShipping: false,
        endCursor: '',
        hasNextPage: false,
        search: '',
        // error messages
    });

    const [customerErrMsg, setCustomerErrMsg] = useState('');
    const [billingErrMsg, setBillingErrMsg] = useState<any>({});
    const [shippingErrMsg, setShippingErrMsg] = useState<any>({});
    const [precentageErrMsg, setPercentageErrMsg] = useState<any>('');
    const [fixedErrMsg, setFixedErrMsg] = useState<any>('');
    const [couponOptionErrMsg, setCouponOptionErrMsg] = useState('');

    const [newAddLine] = useMutation(ADD_NEW_LINE);
    const [updateLine] = useMutation(UPDATE_LINE);
    const [deleteLine] = useMutation(DELETE_LINE);
    const [updateShippingCost, { loading: updateShippingCastLoading }] = useMutation(UPDATE_SHIPPING_COST);
    const [finalizeOrder, { loading: finalizeOrderLoading }] = useMutation(FINALIZE_ORDER);
    const [updateDraftOrder, { loading: updateDraftOrderLoading }] = useMutation(UPDATE_DRAFT_ORDER);
    const [updatefinalDraftOrder, { loading: updateFinalDraftOrderLoading }] = useMutation(UPDATE_DRAFT_ORDER);

    const [addCoupenAmt] = useMutation(ADD_COUPEN);
    const [removeDiscount] = useMutation(REMOVE_DISCOUNT);

    const [updateCoupenAmt] = useMutation(UPDATE_COUPEN);

    const [addNotes] = useMutation(CREATE_NOTES);
    const [deleteNotes] = useMutation(DELETE_NOTES);
    const [updateShippingAddress] = useMutation(UPDATE_SHIPPING_COUNTRY);

    const { data: customer } = useQuery(CUSTOMER_LIST, {
        variables: {
            after: null,
            first: 100,
            query: '',
        },
    });

    const { refetch: customerSearchRefetch } = useQuery(CUSTOMER_LIST, {
        variables: { channel: 'india-channel' },
    });

    const fetchCustomer = async (variables) => {
        return await customerSearchRefetch(variables);
    };

    const { data: countryData } = useQuery(COUNTRY_LIST);

    const { data: customerAddress, refetch: addressRefetch } = useQuery(CUSTOMER_ADDRESS);

    const { data: searchProduct, refetch: searchProductRefetch } = useQuery(PRODUCT_SEARCH);

    const { data: stateData, refetch: stateRefetch } = useQuery(STATES_LIST, {
        variables: { code: state.billingAddress.country },
    });

    const { data: shippingStateData, refetch: shippingStateRefetch } = useQuery(STATES_LIST, {
        variables: { code: state.shippingAddress.country },
    });

    const { data: productDetails, refetch: getOrderData } = useQuery(GET_ORDER_DETAILS, {
        variables: {
            id: orderId,
            isStaffUser: true,
        },
    });

    const channels = () => {
        let channel = '';
        if (typeof window !== 'undefined') {
            const channels = localStorage.getItem('channel');
            if (!channels) {
                channel = 'INR';
            } else {
                channel = channels;
            }
        }
        return channel;
    };

    const { data: productData } = useQuery(FILTER_PRODUCT_LIST, {
        variables: {
            after: null,
            first: 20,
            query: '',
            channel: channels() == 'INR' ? 'india-channel' : 'default-channel',
            address: {
                country: 'IN',
            },
            isPublished: true,
            stockAvailability: 'IN_STOCK',
        },
    });

    const { refetch: productLoadMoreRefetch, loading: productLoadMoreLoading } = useQuery(FILTER_PRODUCT_LIST);

    // // For get Customer list
    // useEffect(() => {
    //     getCustomer();
    // }, [customer]);

    // const getCustomer = () => {
    //     try {
    //         setState({ loading: true });
    //         const funRes = UserDropdownData(customer);
    //         setState({ customerList: funRes, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });

    //         console.log('error: ', error);
    //     }
    // };

    // const getCustomerAddress = () => {
    //     try {
    //         setState({ loading: true });
    //         const funRes = UserDropdownData(customer);
    //         setState({ customerList: funRes, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });

    //         console.log('error: ', error);
    //     }
    // };

    // For get Country list
    useEffect(() => {
        getCountryList();
    }, [countryData]);

    const getCountryList = () => {
        try {
            setState({ loading: true });
            const funRes = CountryDropdownData(countryData);
            setState({ countryList: funRes, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    // For get Billing State list
    useEffect(() => {
        if (state.billingAddress.country) {
            const list = stateData?.addressValidationRules?.countryAreaChoices;
            if (list?.length > 0) {
                const uniqueStateList = getUniqueStates(list);
                setState({ stateList: uniqueStateList, billingAddress: state.billingAddress });
            } else {
                setState({ stateList: [], billingAddress: state.billingAddress });
            }
        }
    }, [stateData]);

    // For get Shipping State list
    useEffect(() => {
        if (state.shippingAddress.country) {
            const list = shippingStateData?.addressValidationRules?.countryAreaChoices;
            if (list?.length > 0) {
                const uniqueStateList = getUniqueStates(list);
                setState({ shippingStateList: uniqueStateList, shippingAddress: state.shippingAddress });
            } else {
                setState({ shippingStateList: [], billingAddress: state.billingAddress });
            }
        }
    }, [shippingStateData]);

    // // Get Specific Customer Address
    // useEffect(() => {
    //     if (state.selectedCustomerId) {
    //         getCustomerAddress();
    //     }
    // }, [customerAddress, state.selectedCustomerId]);

    // Get Order Details
    useEffect(() => {
        getOrderDetails();
    }, [productDetails]);

    const getOrderDetails = () => {
        setState({ loading: true });
        if (productDetails) {
            if (productDetails && productDetails?.order && productDetails?.order?.lines?.length > 0) {
                const list = productDetails?.order?.lines;
                setState({ lineList: list, loading: false });
            } else {
                setState({ loading: false, lineList: [] });
            }

            if (productDetails && productDetails?.order && productDetails?.order?.events?.length > 0) {
                const list = productDetails?.order?.events;
                const filteredArray = list.filter(
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

                setState({ notesList: result, loading: false });
            } else {
                setState({ loading: false });
            }
        } else {
            setState({ loading: false });
        }
    };

    // Get Product Details
    useEffect(() => {
        getProductList();
    }, [productData]);

    const debouncedSearchTerm = useDebounce(state.search, 500); // Debounce with a 500ms delay

    useEffect(() => {
        if (debouncedSearchTerm) {
            handleSearch(debouncedSearchTerm);
        } else {
            getProductList();
        }
    }, [debouncedSearchTerm]);

    // useEffect(() => {
    //     handleSearch();
    // }, [state.search]);

    const handleSearch = async (searchTerm: string) => {
        try {
            if (searchTerm) {
                let channel = '';
                if (channels() == 'INR') {
                    channel = 'india-channel';
                } else {
                    channel = 'default-channel';
                }
                const res = await searchProductRefetch({
                    channel,
                    query: state.search,
                    first: 20,
                    after: null,
                });
                const pageInfo = res?.data?.products?.pageInfo;

                setState({ productList: res?.data?.products?.edges?.map((item: any) => item.node), endCursor: pageInfo?.endCursor, hasNextPage: pageInfo?.hasNextPage });
            } else {
                getProductList();
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getProductList = async () => {
        try {
            setState({ loading: true });
            setState({ endCursor: productData?.search?.pageInfo?.endCursor, hasNextPage: productData?.search?.pageInfo?.hasNextPage });
            const funRes = await productsDropdown(productData?.search?.edges);
            setState({ productList: funRes, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    //Onchange for billing address
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');

        setState({
            billingAddress: {
                ...state.billingAddress,
                [field]: value,
            },
        });
    };

    //Onchange for shipping address
    const handleShippingChange = (e: any) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');

        setState({
            shippingAddress: {
                ...state.shippingAddress,
                [field]: value,
            },
        });
    };

    const setBillingAddress = async () => {
        try {
            if (state.selectedCustomerId != '' && state.selectedCustomerId != undefined) {
                const funRes: any = await setBilling(customerAddress);
                if (!objIsEmpty(funRes)) {
                    setState({ billingAddress: funRes });
                } else {
                    setState({ billingAddress: billingAddress });
                }
            } else {
                Failure('Please choose customer');
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const setShippingAddress = async () => {
        try {
            if (state.selectedCustomerId != '' && state.selectedCustomerId != undefined) {
                const funRes: any = await setShipping(customerAddress);
                if (!objIsEmpty(funRes)) {
                    setState({ shippingAddress: funRes });
                    shippingCoutryChange(funRes?.country);
                } else {
                    setState({ shippingAddress: shippingAddress });
                }
            } else {
                Failure('Please choose customer');
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const updateShippingAmount = async () => {
        try {
            const channel = channels();
            const isINR = channel === 'INR';
            const shippingCountry = state.shippingAddress.country;
            const isIndia = shippingCountry === 'IN';

            let shippingMethod = '';

            if (state.isFreeShipping) {
                if (isINR) {
                    shippingMethod = 'U2hpcHBpbmdNZXRob2Q6MTk=';
                } else {
                    shippingMethod = 'U2hpcHBpbmdNZXRob2Q6MjA=';
                }
            } else {
                if (isINR) {
                    shippingMethod = isIndia ? 'U2hpcHBpbmdNZXRob2Q6Mw==' : 'U2hpcHBpbmdNZXRob2Q6NA==';
                } else {
                    shippingMethod = isIndia ? 'U2hpcHBpbmdNZXRob2Q6OA==' : 'U2hpcHBpbmdNZXRob2Q6OQ==';
                }
            }

            const res = await updateShippingCost({
                variables: {
                    id: orderId,
                    input: {
                        shippingMethod,
                    },
                },
            });
            await getOrderData({
                variables: {
                    id: orderId,
                    isStaffUser: true,
                },
            });
        } catch (error) {
            console.error(error);
        }
    };

    //Add new Product to this order
    const handleHeadingSelect = (heading: any) => {
        const isHeadingChecked = state.selectedItems[heading] && Object.values(state.selectedItems[heading]).every((value) => value);
        const newSelectedItems = {
            ...state.selectedItems,
            [heading]: Object.fromEntries(state.productList?.find((item: any) => item?.name === heading)?.variants?.map(({ name }: any) => [name, !isHeadingChecked])),
        };
        setState({ selectedItems: newSelectedItems });
    };

    const handleSelect = (heading: any, subHeading: any) => {
        const newSelectedItems = { ...state.selectedItems };

        if (subHeading) {
            newSelectedItems[heading] = {
                ...state.selectedItems[heading],
                [subHeading]: !state.selectedItems[heading]?.[subHeading],
            };

            // Check if all children are selected or not
            const allSelected = Object.values(newSelectedItems[heading]).every((value) => value);
            const anySelected = Object.values(newSelectedItems[heading]).some((value) => value);

            if (allSelected) {
                newSelectedItems[heading] = Object.fromEntries(Object.entries(newSelectedItems[heading]).map(([name]) => [name, true]));
            }

            if (!anySelected) {
                delete newSelectedItems[heading];
            }
        } else {
            const isHeadingChecked = state.selectedItems[heading] && Object.values(state.selectedItems[heading]).every((value) => value);
            newSelectedItems[heading] = Object.fromEntries(state.productList.find((item: any) => item.name === heading).variants.map(({ name }: any) => [name, !isHeadingChecked]));
        }
        setState({ selectedItems: newSelectedItems });
    };

    const handleSubHeadingSelect = (heading: any, subHeading: any) => {
        handleSelect(heading, subHeading);
    };

    const addProducts = async () => {
        try {
            setState({ productLoading: true });
            const selectedSubheadingIds: any = [];
            state.productList.forEach(({ name, variants }: any) => {
                if (state.selectedItems[name]) {
                    variants.forEach(({ name: variantName, id }: any) => {
                        if (state.selectedItems[name][variantName]) {
                            selectedSubheadingIds.push(id);
                        }
                    });
                }
            });
            if (selectedSubheadingIds?.length > 0) {
                const input = selectedSubheadingIds.map((item: any) => ({
                    quantity: 1,
                    variantId: item,
                }));

                const data = await newAddLine({
                    variables: {
                        id: orderId,
                        input,
                    },
                });
                updateShippingAmount();
                getOrderData();
                setState({ productLoading: false, search: '' });
                Success('New Product Added Successfully');
                setState({ addProductOpen: false, selectedItems: [] });
            } else {
                setState({ productLoading: false });
                Failure('Please select a product');
            }
        } catch (error) {
            setState({ productLoading: false });

            console.log('error: ', error);
        }
    };

    //Update Product to this order
    const updateQuantity = async () => {
        try {
            setState({ updateProductLoad: true });
            const res = await updateLine({
                variables: {
                    id: state.editProduct.id,
                    input: {
                        quantity: state.quantity,
                    },
                },
            });
            getOrderData();
            setState({ isOpenProductAdd: false, isEditProduct: false, editProduct: {}, productQuantity: '', productIsEdit: false, addProductOpen: false, updateProductLoad: false });
            Success('Product Updated Successfully');
        } catch (error) {
            setState({ updateProductLoad: false });

            console.log('error: ', error);
        }
    };

    //Update Product to this order
    const deleteProduct = async (item: any) => {
        try {
            showDeleteAlert(
                async () => {
                    const res = await deleteLine({
                        variables: {
                            id: item.id,
                        },
                    });
                    setState({ isOpenProductAdd: false, isEditProduct: false, editProduct: {}, productQuantity: '' });
                    if (productDetails?.order?.discounts[0]?.id) {
                        removeTotalDiscounts();
                    }
                    getOrderData();
                    Swal.fire('Deleted!', 'Your product have been deleted.', 'success');
                },
                () => {
                    Swal.fire('Cancelled', 'Your List is safe :)', 'error');
                }
            );
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const removeTotalDiscounts = async () => {
        showDeleteAlert(
            async () => {
                const removeRes = await removeDiscount({
                    variables: {
                        discountId: productDetails?.order?.discounts[0]?.id,
                    },
                });
                getOrderData();
                Swal.fire('Deleted!', 'Your product have been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your List is safe :)', 'error');
            }
        );
    };

    //Add discount to this order
    const addDiscount = async () => {
        setPercentageErrMsg('');
        setFixedErrMsg('');
        setCouponOptionErrMsg(''); // Clear any previous error message

        // Validate coupon option selection
        if (state.coupenOption !== 'percentage' && state.coupenOption !== 'fixed') {
            setCouponOptionErrMsg('Please select this field'); // Set error message if no option is selected
            return; // Stop form submission if validation fails
        }

        if (state.coupenOption == 'percentage' && !state.percentcoupenValue) {
            setPercentageErrMsg('Please Enter Percentage');
        }
        if (state.coupenOption == 'fixed' && !state.fixedcoupenValue) {
            setFixedErrMsg('Please Enter Fixed Value');
        }
        try {
            if (productDetails?.order?.discounts?.length > 0) {
                const removeRes = await removeDiscount({
                    variables: {
                        discountId: productDetails?.order?.discounts[0]?.id,
                    },
                });
            }
            const res = await addCoupenAmt({
                variables: {
                    orderId: orderId,
                    input: {
                        reason: '',
                        value: state.coupenOption == 'percentage' ? state.percentcoupenValue : state.fixedcoupenValue,
                        valueType: state.coupenOption == 'percentage' ? 'PERCENTAGE' : 'FIXED',
                    },
                },
            });
            console.log('res: ', res);
            if (res?.data?.orderDiscountAdd?.errors?.length > 0) {
                Failure(res?.data?.orderDiscountAdd?.errors[0]?.message);
            } else {
                getOrderData();
                setState({ coupenOption: 'percentage', isOpenCoupen: false, percentcoupenValue: '', fixedcoupenValue: '' });
            }
            // setIsOpenCoupen(false);
            // setFixedCoupenValue('');
            // setPercentCoupenValue('');
        } catch (error) {
            console.log('error: ', error);
        }
    };

    //Update discount to this order
    const updateDiscount = async () => {
        setPercentageErrMsg('');
        setFixedErrMsg('');
        setCouponOptionErrMsg(''); // Clear any previous error message

        // Validate coupon option selection
        if (state.coupenOption !== 'percentage' && state.coupenOption !== 'fixed') {
            setCouponOptionErrMsg('Please select this field'); // Set error message if no option is selected
            return; // Stop form submission if validation fails
        }
        if (state.coupenOption == 'percentage' && !state.percentcoupenValue) {
            setPercentageErrMsg('Please Enter Percentage');
        }
        if (state.coupenOption == 'fixed' && !state.fixedcoupenValue) {
            setFixedErrMsg('Please Enter Fixed Value');
        }
        try {
            const res = await updateCoupenAmt({
                variables: {
                    discountId: productDetails?.order?.discounts[0]?.id,

                    input: {
                        reason: '',
                        value: state.coupenOption == 'percentage' ? state.percentcoupenValue : state.fixedcoupenValue,
                        valueType: state.coupenOption == 'percentage' ? 'PERCENTAGE' : 'FIXED',
                    },
                },
            });
            getOrderData();
            setState({ selectedOption: 'percentage', isOpenCoupen: false, percentcoupenValue: '', fixedcoupenValue: '' });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const SubmittedForm = Yup.object().shape({
        message: Yup.string().required('Please fill the message'),
    });

    const onSubmit = async (record: any, { resetForm }: any) => {
        try {
            const data = await addNotes({
                variables: { input: { message: record.message }, orderId, private_note: record.mail },
            });
            setState({ notesList: data?.data?.orderNoteAdd?.order?.events });
            Success('Notes Added Successfully');

            resetForm();
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const removeNotes = (item: any) => {
        showDeleteAlert(
            async () => {
                await deleteNotes({
                    variables: { noteId: item.id },
                });
                const filter = state.notesList?.filter((data: any) => data.id !== item.id);
                setState({ notesList: filter });
                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your List is safe :)', 'error');
            }
        );
    };

    const createOrder = async () => {
        try {
            setCustomerErrMsg('');
            if (!state.selectedCustomerId) {
                setCustomerErrMsg('Required this field');
            } else if (state.lineList.length == 0) {
                Failure('Please add product to order');
            } else {
                const data = await updatefinalDraftOrder({
                    variables: {
                        id: orderId,
                        input: {
                            user: state.selectedCustomerId,
                            billingAddress: {
                                city: state.billingAddress.city,
                                cityArea: '',
                                companyName: state.billingAddress.company,
                                country: state.billingAddress.country,
                                countryArea: state.billingAddress.state,
                                firstName: state.billingAddress.firstName,
                                lastName: state.billingAddress.lastName,
                                phone: state.billingAddress.phone,
                                postalCode: state.billingAddress.pincode,
                                streetAddress1: state.billingAddress.address_1,
                                // streetAddress2: state.billingAddress.address_2,
                            },
                            shippingAddress: {
                                city: state.shippingAddress.city,
                                cityArea: '',
                                companyName: state.shippingAddress.company,
                                country: state.shippingAddress.country,
                                countryArea: state.shippingAddress.state,
                                firstName: state.shippingAddress.firstName,
                                lastName: state.shippingAddress.lastName,
                                phone: state.shippingAddress.phone,
                                postalCode: state.shippingAddress.pincode,
                                streetAddress1: state.shippingAddress.address_1,
                                // streetAddress2: state.shippingAddress.address_2,
                            },
                        },
                    },
                });
                finalizeNewOrder();
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const finalizeNewOrder = async () => {
        try {
            const res = await finalizeOrder({
                variables: {
                    id: orderId,
                },
            });
            if (res?.data?.draftOrderComplete?.errors?.length > 0) {
                Failure(res?.data?.draftOrderComplete?.errors[0]?.message);
            } else {
                getOrderData();
                Success('Order Created Successfully');
                router.push(`/orders/editorder?id=${orderId}`);
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleChangeCustomer = async (val: any) => {
        if (val) {
            const selectedCustomerId: any = val?.value;
            setState({ selectedCustomerId: selectedCustomerId, showShippingInputs: true, showBillingInputs: true });

            await addressRefetch({ id: selectedCustomerId });
        }
    };

    const shippingCoutryChange = async (country: any) => {
        try {
            stateRefetch();
            await updateShippingAddress({
                variables: {
                    checkoutId: orderId,
                    shippingAddress: {
                        country,
                    },
                },
            });
            setState({
                selectedCountry1: country,
                selectedState1: '',
            });
        } catch (e) {
            console.log('e: ', e);
        }
    };

    const updateAddress = async () => {
        if (state.selectedCustomerId == '') {
            Failure('Please select customer');
            return false;
        }
        setBillingErrMsg({});
        setShippingErrMsg({});
        const address = AddressValidation(state);
        setShippingErrMsg(address.shippingAddress);
        setBillingErrMsg(address.billingAddress);
        if (Object.keys(address.shippingAddress).length > 0 || Object.keys(address.billingAddress).length > 0) {
            setState({ setUpdateAddressLoading: false });
            return;
        }
        try {
            const res = await updateDraftOrder({
                variables: {
                    id: orderId,
                    input: {
                        shippingAddress: {
                            city: state.shippingAddress.city,
                            cityArea: '',
                            companyName: state.shippingAddress.company,
                            country: state.shippingAddress.country,
                            countryArea: state.shippingAddress.state,
                            firstName: state.shippingAddress.firstName,
                            lastName: state.shippingAddress.lastName,
                            phone: state.shippingAddress.phone,
                            postalCode: state.shippingAddress.pincode,
                            streetAddress1: state.shippingAddress.address_1,
                            // streetAddress2: state.shippingAddress.address_2,
                        },
                    },
                },
            });
            if (res?.data?.draftOrderUpdate?.errors?.length > 0) {
                Failure(res?.data?.draftOrderUpdate?.errors[0]?.message);
            } else {
                updateShippingAmount();
                await getOrderData();

                Success('Address updated successfully');
            }
            setState({ setUpdateAddressLoading: false });
        } catch (error) {
            setState({ setUpdateAddressLoading: false });
            Failure(error);
            console.log('error: ', error);
        }
    };

    const loadMoreProducts = async () => {
        try {
            if (state.hasNextPage) {
                const newProducts = await productLoadMoreRefetch({
                    after: state.endCursor,
                    first: 20,
                    query: '',
                    channel: channels() == 'INR' ? 'india-channel' : 'default-channel',
                    address: {
                        country: 'IN',
                    },
                    isPublished: true,
                    stockAvailability: 'IN_STOCK',
                }); // Your logic to fetch more products
                setState({ endCursor: newProducts?.data?.search?.pageInfo?.endCursor, hasNextPage: newProducts?.data?.search?.pageInfo?.hasNextPage });
                const funRes = await productsDropdown(newProducts?.data?.search?.edges);
                setState({ productList: [...state.productList, ...funRes], loading: false });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const loadMoreSearchProduct = async () => {
        try {
            if (state.hasNextPage) {
                let channel = '';
                if (channels() == 'INR') {
                    channel = 'india-channel';
                } else {
                    channel = 'default-channel';
                }
                const res = await searchProductRefetch({
                    channel,
                    query: state.search,
                    first: 20,
                    after: state.endCursor,
                });

                const funRes = await productsDropdown(res?.data?.products?.edges);
                setState({ productList: [...state.productList, ...funRes], endCursor: res?.data?.products?.pageInfo?.endCursor, hasNextPage: res?.data?.products?.pageInfo?.hasNextPage });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    return (
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
                            <h3 className="text-lg font-semibold">Order Details</h3>
                            {/* <p className=" pt-1 text-gray-500">Payment via Cash on delivery. Customer IP: 122.178.161.16</p> */}
                        </div>
                        <div className="mt-8">
                            <h5 className="mb-3 text-lg font-semibold">General</h5>
                            <div className="grid grid-cols-12 gap-5">
                                <div className="col-span-4">
                                    <div className=" flex  items-center justify-between">
                                        <label htmlFor="status" className="block pr-2 text-sm font-medium text-gray-700">
                                            Customer:
                                        </label>
                                    </div>

                                    <CustomerSelect
                                        queryFunc={fetchCustomer} // Pass the function to fetch categories
                                        selectedCategory={state.selectedCustomer} // Use 'selectedCategory' instead of 'value'
                                        onCategoryChange={(val) => handleChangeCustomer(val)} // Use 'onCategoryChange' instead of 'onChange'
                                        placeholder="Select a customer"
                                        isMulti={false}
                                    />

                                    {/* <select
                                        className="form-select"
                                        value={state.selectedCustomer}
                                        onChange={(val) => {
                                            handleChangeCustomer(val);
                                        }}
                                    >
                                        <option value="" disabled selected>
                                            Select a customer
                                        </option>
                                        {state.customerList?.map((item: any) => (
                                            <option key={item?.value} value={item?.value}>
                                                {item?.label}
                                            </option>
                                        ))}
                                    </select> */}
                                    {customerErrMsg && <p className="text-red-500">{customerErrMsg}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="panel mt-8 grid grid-cols-12 gap-5 p-5">
                        {/* Billing Address */}
                        <div className="col-span-6 mr-5">
                            <div className="flex w-52 items-center justify-between">
                                <h5 className="mb-3 text-lg font-semibold">Billing</h5>
                                <button type="button" onClick={() => setState({ showBillingInputs: !state.showBillingInputs })}>
                                    <IconPencil className="cursor-pointer" />
                                </button>
                            </div>
                            {state.showBillingInputs === false ? (
                                <>
                                    {isEmptyObject(state.billingAddress) ? (
                                        <>
                                            <p>Address :</p>
                                            <p>No billing address set. </p>
                                        </>
                                    ) : (
                                        <div className="mt-3 text-gray-500">
                                            <p>{`${state.billingAddress?.firstName} ${state.billingAddress?.lastName}`}</p>
                                            <p>{state.billingAddress?.company}</p>
                                            <p>
                                                {state.billingAddress?.address_1}
                                                {/* <br />
                                                {state.billingAddress?.address_2} */}
                                                <br /> {state.billingAddress?.city}
                                                <br /> {state.billingAddress?.state}
                                                <br /> {state.billingAddress?.country}
                                                <br /> {state.billingAddress?.pincode}
                                            </p>
                                            {state.billingAddress?.email && (
                                                <>
                                                    <p className="mt-3 font-semibold">Email Address:</p>
                                                    <p>
                                                        <a href={`mailto:${state.billingAddress?.email}`} className="text-primary underline">
                                                            {state.billingAddress?.email}
                                                        </a>
                                                    </p>
                                                </>
                                            )}
                                            {state.billingAddress?.phone && (
                                                <>
                                                    <p className="mt-3 font-semibold">Phone:</p>
                                                    <p>
                                                        <a href={`tel:${state.billingAddress?.phone}`} className="text-primary underline">
                                                            {state.billingAddress?.phone}
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
                                                className={`form-input ${state.billingAddress['billing.firstName'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.firstName"
                                                value={state.billingAddress?.firstName}
                                                onChange={handleChange}
                                            />
                                            {/* {billingErrMsg?.firstName && <div className="mt-1 text-danger">{billingErrMsg.firstName}</div>} */}
                                            {state.billingAddress['billing.firstName'] && <div className="mt-1 text-danger">{state.billingAddress['billing.firstName']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="Lastname" className=" text-sm font-medium text-gray-700">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.lastName'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.lastName"
                                                value={state.billingAddress?.lastName}
                                                onChange={handleChange}
                                            />
                                            {/* {billingErrMsg.lastName && <div className="mt-1 text-danger">{billingErrMsg.lastName}</div>} */}
                                            {state.billingAddress['billing.lastName'] && <div className="mt-1 text-danger">{state.billingAddress['billing.lastName']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-12">
                                            <label htmlFor="company" className=" text-sm font-medium text-gray-700">
                                                Company
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.company'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.company"
                                                value={state.billingAddress?.company}
                                                onChange={handleChange}
                                            />
                                            {/* {billingErrMsg?.company && <div className="mt-1 text-danger">{billingErrMsg.company}</div>} */}
                                            {state.billingAddress['billing.company'] && <div className="mt-1 text-danger">{state.billingAddress['billing.company']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-12">
                                            <label htmlFor="addressline1" className=" text-sm font-medium text-gray-700">
                                                Addres Line 1
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.address_1'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.address_1"
                                                value={state.billingAddress?.address_1}
                                                onChange={handleChange}
                                            />
                                            {/* {billingErrMsg.address_1 && <div className="mt-1 text-danger">{billingErrMsg.address_1}</div>} */}
                                            {state.billingAddress['billing.address_1'] && <div className="mt-1 text-danger">{state.billingAddress['billing.address_1']}</div>}
                                        </div>
                                        {/* <div className="col-span-6">
                                            <label htmlFor="addressline2" className=" text-sm font-medium text-gray-700">
                                                Addres Line 2
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.address_2'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.address_2"
                                                value={state.billingAddress?.address_2}
                                                onChange={handleChange}
                                            />
                                            {billingErrMsg.address_2 && <div className="mt-1 text-danger">{billingErrMsg.address_2}</div>}
                                            {state.billingAddress['billing.address_2'] && <div className="mt-1 text-danger">{state.billingAddress['billing.address_2']}</div>}
                                        </div> */}
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="country" className=" text-sm font-medium text-gray-700">
                                                Country / Region
                                            </label>
                                            <select
                                                className={`form-select mr-3 ${state.billingAddress['billing.country'] && 'border border-danger focus:border-danger'}`}
                                                id="billingcountry"
                                                name="billing.country"
                                                value={state.billingAddress?.country}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    stateRefetch();
                                                }}
                                            >
                                                <option value="Select a country">Select a country</option>
                                                {state.countryList?.map((item: any) => (
                                                    <option key={item.code} value={item.code}>
                                                        {item.country}
                                                    </option>
                                                ))}
                                            </select>
                                            {/* {billingErrMsg.country && <div className="mt-1 text-danger">{billingErrMsg.country}</div>} */}
                                            {state.billingAddress['billing.country'] && <div className="mt-1 text-danger">{state.billingAddress['billing.country']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="state" className=" text-sm font-medium text-gray-700">
                                                State / Country
                                            </label>
                                            {state.stateList?.length > 0 ? (
                                                <select
                                                    className={`form-select mr-3 ${state.billingAddress['billing.state'] && 'border border-danger focus:border-danger'}`}
                                                    id="billingstate"
                                                    name="billing.state"
                                                    value={state.billingAddress?.state}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                    }}
                                                >
                                                    <option value="Select a state">Select a state</option>
                                                    {state.stateList?.map((item: any) => (
                                                        <option key={item.raw} value={item.raw}>
                                                            {item.raw}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className={`form-select mr-3 ${state.billingAddress['billing.state'] && 'border border-danger focus:border-danger'}`}
                                                    id="billingstate"
                                                    name="billing.state"
                                                    value={state.billingAddress?.state}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                    }}
                                                />
                                            )}
                                            {billingErrMsg.state && <div className="mt-1 text-danger">{billingErrMsg.state}</div>}
                                            {/* {state.billingAddress['billing.state'] && <div className="mt-1 text-danger">{state.billingAddress['billing.state']}</div>} */}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="city" className=" text-sm font-medium text-gray-700">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.city'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.city"
                                                value={state.billingAddress?.city}
                                                onChange={handleChange}
                                            />
                                            {/* {billingErrMsg.city && <div className="mt-1 text-danger">{billingErrMsg.city}</div>} */}
                                            {state.billingAddress['billing.city'] && <div className="mt-1 text-danger">{state.billingAddress['billing.city']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="pincode" className=" text-sm font-medium text-gray-700">
                                                Post Code / ZIP
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.pincode'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.pincode"
                                                value={state.billingAddress?.pincode}
                                                onChange={handleChange}
                                            />
                                            {/* {billingErrMsg.pincode && <div className="mt-1 text-danger">{billingErrMsg.pincode}</div>} */}
                                            {state.billingAddress['billing.pincode'] && <div className="mt-1 text-danger">{state.billingAddress['billing.pincode']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        {/* <div className="col-span-6">
                                            <label htmlFor="email" className=" text-sm font-medium text-gray-700">
                                                Email address
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.email'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.email"
                                                value={state.billingAddress?.email}
                                                // maxLength={10}
                                                onChange={handleChange}
                                            />
                                            {billingErrMsg.email && <div className="mt-1 text-danger">{billingErrMsg.email}</div>}
                                            {state.billingAddress['billing.email'] && <div className="mt-1 text-danger">{state.billingAddress['billing.email']}</div>}

                                        </div> */}
                                        <div className="col-span-6">
                                            <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                                                Phone
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.phone'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.phone"
                                                value={state.billingAddress?.phone}
                                                maxLength={10}
                                                onChange={handleChange}
                                            />
                                            {/* {billingErrMsg.phone && <div className="mt-1 text-danger">{billingErrMsg.phone}</div>} */}
                                            {state.billingAddress['billing.phone'] && <div className="mt-1 text-danger">{state.billingAddress['billing.phone']}</div>}
                                        </div>
                                    </div>

                                    {/* <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-12">
                                            <label htmlFor="payments" className=" text-sm font-medium text-gray-700">
                                                Payment method:
                                            </label>
                                            <select className="form-select mr-3" id="billingpayments" name="billing.paymentMethod" value={state.billingAddress?.paymentMethod} onChange={handleChange}>
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
                                            <input type="text" className="form-input" name="billing.transactionId" value={state.billingAddress?.transactionId} onChange={handleChange} />
                                        </div>
                                    </div> */}
                                </>
                            )}
                        </div>

                        {/* Shipping Address */}
                        <div className="col-span-6 mr-5">
                            <div className="flex w-52 items-center justify-between">
                                <h5 className="mb-3 text-lg font-semibold">Shipping</h5>
                                <button type="button" onClick={() => setState({ showShippingInputs: !state.showShippingInputs })}>
                                    <IconPencil />
                                </button>
                            </div>

                            {state.showShippingInputs === false ? (
                                <>
                                    {isEmptyObject(state.shippingAddress) ? (
                                        <>
                                            <p>Address :</p>
                                            <p>No shipping address set. </p>
                                        </>
                                    ) : (
                                        <div className="mt-3 text-gray-500">
                                            <p>{`${state.shippingAddress?.firstName} ${state.shippingAddress?.lastName}`}</p>
                                            <p>{state.shippingAddress?.company}</p>
                                            <p>
                                                {state.shippingAddress?.address_1}
                                                <br /> {state.shippingAddress?.city}
                                                <br /> {state.shippingAddress?.state}
                                                {/* <br /> {state.shippingAddress?.countryArea} */}
                                                <br /> {state.shippingAddress?.country}
                                                <br /> {state.shippingAddress?.pincode}
                                            </p>
                                            {state.shippingAddress?.email && (
                                                <>
                                                    <p className="mt-3 font-semibold">Email Address:</p>
                                                    <p>
                                                        <a href={`mailto:${state.shippingAddress?.email}`} className="text-primary underline">
                                                            {state.shippingAddress?.email}
                                                        </a>
                                                    </p>
                                                </>
                                            )}
                                            {state.shippingAddress?.phone && (
                                                <>
                                                    <p className="mt-3 font-semibold">Phone:</p>
                                                    <p>
                                                        <a href={`tel:${state.shippingAddress?.phone}`} className="text-primary underline">
                                                            {state.shippingAddress?.phone}
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
                                    <button onClick={() => setState({ shippingAddress: state.billingAddress })} className="mr-3 text-primary underline">
                                        Copy Billing address
                                    </button>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="firstname" className=" text-sm font-medium text-gray-700">
                                                First Name
                                            </label>

                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.firstName'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.firstName"
                                                value={state.shippingAddress.firstName}
                                                onChange={handleShippingChange}
                                            />
                                            {/* {shippingErrMsg.firstName && <div className="mt-1 text-danger">{shippingErrMsg.firstName}</div>} */}
                                            {state.shippingAddress['shipping.firstName'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.firstName']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="Lastname" className=" text-sm font-medium text-gray-700">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.lastName'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.lastName"
                                                value={state.shippingAddress.lastName}
                                                onChange={handleShippingChange}
                                            />
                                            {/* {shippingErrMsg.lastName && <div className="mt-1 text-danger">{shippingErrMsg.lastName}</div>} */}
                                            {state.shippingAddress['shipping.lastName'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.lastName']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-12">
                                            <label htmlFor="company" className=" text-sm font-medium text-gray-700">
                                                Company
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.company'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.company"
                                                value={state.shippingAddress.company}
                                                onChange={handleShippingChange}
                                            />
                                            {/* {shippingErrMsg.company && <div className="mt-1 text-danger">{shippingErrMsg.company}</div>} */}
                                            {state.shippingAddress['shipping.company'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.company']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-12">
                                            <label htmlFor="addressline1" className=" text-sm font-medium text-gray-700">
                                                Addres Line 1
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.address_1'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.address_1"
                                                value={state.shippingAddress.address_1}
                                                onChange={handleShippingChange}
                                            />
                                            {/* {shippingErrMsg.address_1 && <div className="mt-1 text-danger">{shippingErrMsg.address_1}</div>} */}
                                            {state.shippingAddress['shipping.address_1'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.address_1']}</div>}
                                        </div>
                                        {/* <div className="col-span-6">
                                            <label htmlFor="addressline2" className=" text-sm font-medium text-gray-700">
                                                Addres Line 2
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.address_2'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.address_2"
                                                value={state.shippingAddress.address_2}
                                                onChange={handleShippingChange}
                                            />
                                            {shippingErrMsg.address_2 && <div className="mt-1 text-danger">{shippingErrMsg.address_2}</div>}
                                            {state.shippingAddress['shipping.address_2'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.address_2']}</div>}
                                        </div> */}
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="country" className=" text-sm font-medium text-gray-700">
                                                Country / Region
                                            </label>
                                            <select
                                                className={`form-select mr-3 ${state.shippingAddress['shipping.country'] && 'border border-danger focus:border-danger'}`}
                                                id="shippingcountry"
                                                name="shipping.country"
                                                value={state.shippingAddress.country}
                                                onChange={(e) => {
                                                    handleShippingChange(e);
                                                    shippingStateRefetch();
                                                    shippingCoutryChange(e.target.value);
                                                }}
                                            >
                                                <option value="Select a country">Select a country</option>

                                                {state.countryList?.map((item: any) => (
                                                    <option key={item.code} value={item.code}>
                                                        {item.country}
                                                    </option>
                                                ))}
                                            </select>
                                            {/* {shippingErrMsg.country && <div className="mt-1 text-danger">{shippingErrMsg.country}</div>} */}
                                            {state.shippingAddress['shipping.country'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.country']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="state" className=" text-sm font-medium text-gray-700">
                                                State / Country
                                            </label>
                                            {state.shippingStateList?.length > 0 ? (
                                                <select
                                                    className={`form-select mr-3 ${state.shippingAddress['shipping.state'] && 'border border-danger focus:border-danger'}`}
                                                    id="shippingstate"
                                                    name="shipping.state"
                                                    value={state.shippingAddress.state}
                                                    onChange={handleShippingChange}
                                                >
                                                    <option value="Select a state">Select a state</option>

                                                    {state.shippingStateList?.map((item: any) => (
                                                        <option key={item.raw} value={item.raw}>
                                                            {item.raw}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    className={`form-select mr-3 ${state.shippingAddress['shipping.state'] && 'border border-danger focus:border-danger'}`}
                                                    id="shippingstate"
                                                    name="shipping.state"
                                                    value={state.shippingAddress.state}
                                                    onChange={handleShippingChange}
                                                    type="text"
                                                />
                                            )}
                                            {shippingErrMsg.state && <div className="mt-1 text-danger">{shippingErrMsg.state}</div>}
                                            {/* {state.shippingAddress['shipping.state'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.state']}</div>} */}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="city" className=" text-sm font-medium text-gray-700">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.city'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.city"
                                                value={state.shippingAddress.city}
                                                onChange={handleShippingChange}
                                            />
                                            {/* {shippingErrMsg.city && <div className="mt-1 text-danger">{shippingErrMsg.city}</div>} */}
                                            {state.shippingAddress['shipping.city'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.city']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="pincode" className=" text-sm font-medium text-gray-700">
                                                Post Code / ZIP
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.pincode'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.pincode"
                                                value={state.shippingAddress.pincode}
                                                onChange={handleShippingChange}
                                            />
                                            {/* {shippingErrMsg.pincode && <div className="mt-1 text-danger">{shippingErrMsg.pincode}</div>} */}
                                            {state.shippingAddress['shipping.pincode'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.pincode']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        {/* <div className="col-span-6">
                                            <label htmlFor="email" className=" text-sm font-medium text-gray-700">
                                                Email address
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.email'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.email"
                                                value={state.shippingAddress.email}
                                                // maxLength={10}
                                                onChange={handleShippingChange}
                                            />
                                            {shippingErrMsg.email && <div className="mt-1 text-danger">{shippingErrMsg.email}</div>}
                                            {state.shippingAddress['shipping.email'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.email']}</div>}
                                        </div> */}
                                        <div className="col-span-6">
                                            <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                                                Phone
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.phone'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.phone"
                                                value={state.shippingAddress.phone}
                                                maxLength={10}
                                                onChange={handleShippingChange}
                                            />
                                            {shippingErrMsg.phone && <div className="mt-1 text-danger">{shippingErrMsg.phone}</div>}
                                            {state.shippingAddress['shipping.phone'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.phone']}</div>}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="col-span-12 flex  items-center justify-end gap-5">
                            <div className="flex cursor-pointer items-center gap-3" onClick={() => setState({ isFreeShipping: !state.isFreeShipping })}>
                                <input
                                    type="checkbox"
                                    checked={state.isFreeShipping}
                                    onChange={(e) => setState({ isFreeShipping: e.target.checked })}
                                    className="form-checkbox border-white-light dark:border-white-dark ltr:mr-0 rtl:ml-0"
                                />
                                <h3 className="text-md font-semibold dark:text-white-light">Free Shipping</h3>
                            </div>
                            <div className="">
                                <button type="button" className="btn btn-primary" onClick={() => updateAddress()}>
                                    {updateDraftOrderLoading || updateShippingCastLoading ? <IconLoader /> : 'Update Address'}
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Product table  */}
                    <div className="panel mt-8 p-5">
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Image</th>
                                        <th>SKU</th>
                                        <th className="w-1">Cost</th>
                                        <th className="w-1">Qty</th>
                                        <th>Total</th>
                                        <th>Action</th>
                                        <th className="w-1"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.lineList?.map((item: any, index: any) => (
                                        <tr className="align-top" key={index}>
                                            <td>{item?.productName}</td>
                                            <td>
                                                <img src={profilePic(item?.variant?.product?.thumbnail?.url)} height={80} width={80} />
                                            </td>
                                            <td>{item?.productSku}</td>
                                            <td>{`${formatCurrency(item?.unitPrice?.gross?.currency)}${addCommasToNumber(item?.unitPrice?.gross?.amount)}`} </td>

                                            {/* <td>
                                                  
                                                {item?.unitPrice?.gross?.currency} {item?.unitPrice?.gross?.amount}
                                            </td> */}
                                            <td>{item?.quantity}</td>
                                            <td>{`${formatCurrency(item?.totalPrice?.gross?.currency)}${addCommasToNumber(item?.totalPrice?.gross?.amount)}`} </td>

                                            {/* <td>
                                                {item?.totalPrice?.gross?.currency} {item?.totalPrice?.gross?.amount}
                                            </td> */}

                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setState({ editProduct: item, productIsEdit: true, addProductOpen: true, quantity: item?.quantity });
                                                    }}
                                                >
                                                    <IconPencil className="mr-3 h-5 w-5" />
                                                </button>
                                                <button type="button" onClick={() => deleteProduct(item)}>
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
                                    <div>Items Subtotal:</div>
                                    <div>
                                        {`${formatCurrency(productDetails?.order?.subtotal?.gross?.currency)}${addCommasToNumber(productDetails?.order?.subtotal?.gross?.amount)}`}

                                        {/* {productDetails?.order?.subtotal?.gross?.currency} {productDetails?.order?.subtotal?.gross?.amount} */}
                                    </div>
                                </div>
                                {state.shippingAddress?.state !== '' &&
                                    (state.shippingAddress?.state == 'Tamil Nadu' ? (
                                        <>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div>SGST</div>
                                                <div>
                                                    {`${formatCurrency(productDetails?.order?.total?.gross?.currency)}${addCommasToNumber(productDetails?.order?.total?.tax?.amount / 2)}`}

                                                    {/* {productDetails?.order?.subtotal?.gross?.currency} {productDetails?.order?.subtotal?.gross?.amount} */}
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div>CSGT</div>
                                                <div>
                                                    {`${formatCurrency(productDetails?.order?.total?.gross?.currency)}${addCommasToNumber(productDetails?.order?.total?.tax?.amount / 2)}`}

                                                    {/* {productDetails?.order?.subtotal?.gross?.currency} {productDetails?.order?.subtotal?.gross?.amount} */}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="mt-4 flex items-center justify-between">
                                            <div>IGST</div>
                                            <div>
                                                {`${formatCurrency(productDetails?.order?.total?.gross?.currency)}${addCommasToNumber(productDetails?.order?.total?.gross?.amount)}`}

                                                {/* {`${formatCurrency(productDetails?.order?.subtotal?.gross?.currency)}${addCommasToNumber(productDetails?.subtotal?.total?.gross?.amount)}`} */}

                                                {/* {productDetails?.order?.subtotal?.gross?.currency} {productDetails?.order?.subtotal?.gross?.amount} */}
                                            </div>
                                        </div>
                                    ))}

                                {productDetails?.order?.shippingPrice?.gross?.amount != 0 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div>Shipping Rate</div>
                                        <div>
                                            {`${formatCurrency(productDetails?.order?.shippingPrice?.gross?.currency)}${addCommasToNumber(productDetails?.order?.shippingPrice?.gross?.amount)}`}

                                            {/* {productDetails?.order?.shippingMethods[0]?.price?.currency} {productDetails?.order?.shippingMethods[0]?.price?.amount} */}
                                        </div>
                                    </div>
                                )}
                                {state.line?.length}
                                {productDetails?.order?.discounts?.length > 0 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex">
                                            <div>Discount</div>
                                            <div className=" cursor-pointer" onClick={() => removeTotalDiscounts()}>
                                                <IconTrashLines className="text-red-500" />
                                            </div>
                                        </div>

                                        <div className="">
                                            {productDetails?.order?.discounts[0]?.calculationMode == 'PERCENTAGE' ? (
                                                <div>
                                                    {`${`(${productDetails?.order?.discounts[0]?.value}%)`} ${formatCurrency(productDetails?.order?.discounts[0]?.amount?.currency)}${addCommasToNumber(
                                                        productDetails?.order?.discounts[0]?.amount?.amount
                                                    )}`}
                                                </div>
                                            ) : (
                                                <div>{`${formatCurrency(productDetails?.order?.discounts[0]?.amount?.currency)}${addCommasToNumber(
                                                    productDetails?.order?.discounts[0]?.amount?.amount
                                                )}`}</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="mt-4 flex items-center justify-between font-semibold">
                                    <div>Total</div>

                                    <div>
                                        <div className="ml-[124px] justify-end">{`${formatCurrency(productDetails?.order?.total?.gross?.currency)}${addCommasToNumber(
                                            productDetails?.order?.total?.gross?.amount
                                        )}`}</div>

                                        <div className="pl-8 text-sm">
                                            (includes {productDetails?.order?.total?.tax?.currency == 'USD' ? '$' : '₹'}
                                            {addCommasToNumber(productDetails?.order?.total?.tax?.amount)} GST)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between  gap-2 border-t border-gray-200 pt-5">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => setState({ addProductOpen: true })}
                                    // setQuantity(0);
                                    // setProductIsEdit(false);
                                    // setAddProductOpen(true);
                                >
                                    Add Product
                                </button>
                                <button type="button" className="btn btn-outline-primary" onClick={() => setState({ isOpenCoupen: true })}>
                                    Apply coupon
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className=" col-span-3 mb-5  ">
                    <div className="panel mb-5 p-5">
                        <div className="mb-5  ">
                            <h3 className="text-lg font-semibold">Order Actions</h3>
                        </div>
                        <div>
                            {/* <select className="form-select mr-3">
                                <option value="">Choose An Action</option>
                                <option value="Email Invoice">Email Invoice</option>
                            </select> */}
                        </div>
                        <div className="mt-5 border-t border-gray-200 pb-2 ">
                            <div className="flex flex-row-reverse items-center justify-between pt-3">
                                {/* <a href="#" className="text-danger underline">
                                            Move To Trash
                                        </a> */}
                                <button onClick={() => createOrder()} className="btn btn-outline-primary">
                                    {updateFinalDraftOrderLoading || finalizeOrderLoading ? <IconLoader /> : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="panel max-h-[810px]  overflow-y-auto p-5">
                        <div className="mb-5 border-b border-gray-200 pb-2 ">
                            <h3 className="text-lg font-semibold">Order Notes</h3>
                        </div>
                        <div className="mb-5 border-b border-gray-200 pb-2 ">
                            {state.notesList?.length > 0 ? (
                                state.notesList?.map((data: any, index: number) => {
                                    return (
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
                                    );
                                })
                            ) : (
                                <span className=" mr-1 border-b border-dotted border-gray-500">No data found</span>
                            )}

                            {/* <div className="mb-5">
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
                            </div> */}
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
                edit={state.productIsEdit}
                addHeader={'Add Product'}
                updateHeader={'Update Product'}
                open={state.addProductOpen}
                close={() => setState({ addProductOpen: false, productIsEdit: false, search: '' })}
                renderComponent={() => (
                    <>
                        {state.productIsEdit ? (
                            <div className="p-5">
                                <div className="p-5">
                                    <input type="number" min={1} className="form-input" value={state.quantity} onChange={(e) => setState({ quantity: e.target.value })} />
                                </div>
                                <div className="flex justify-end gap-5">
                                    <button
                                        onClick={() => {
                                            setState({ selectedItems: {}, addProductOpen: false, productIsEdit: false });
                                        }}
                                        className="rounded border border-black bg-transparent px-4 py-2 font-semibold text-black hover:border-transparent hover:bg-blue-500 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => updateQuantity()}
                                        className="rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-500 hover:border-transparent hover:bg-blue-500 hover:text-white"
                                    >
                                        {state.updateProductLoad ? <IconLoader /> : 'Update'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[700px] p-5">
                                <div className="p-3">
                                    <input type="text" className="form-input w-full p-3" placeholder="Search..." value={state.search} onChange={(e) => setState({ search: e.target.value })} />
                                </div>

                                {productLoadMoreLoading ? (
                                    <CommonLoader />
                                ) : (
                                    <div className="h-[550px] overflow-auto">
                                        {/* Product list */}
                                        {state.productList?.map(({ name, variants, thumbnail }: any) => (
                                            <div key={name}>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="checkbox"
                                                        className="form-checkbox"
                                                        checked={state.selectedItems[name] && Object.values(state.selectedItems[name])?.every((value) => value)}
                                                        onChange={() => handleHeadingSelect(name)}
                                                    />
                                                    <img src={profilePic(thumbnail?.url)} height={30} width={30} alt={name} />
                                                    <div>{name}</div>
                                                </div>
                                                <ul>
                                                    {variants?.map(({ name: variantName, sku, costPrice, pricing }: any) => (
                                                        <li key={variantName} className="py-5 pl-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-checkbox"
                                                                        checked={state.selectedItems[name]?.[variantName]}
                                                                        onChange={() => handleSubHeadingSelect(name, variantName)}
                                                                    />
                                                                    <div>
                                                                        <div>{variantName}</div>
                                                                        <div>{sku}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex">
                                                                    <div>
                                                                        <div>{`${formatCurrency(pricing?.price?.gross?.currency)}${addCommasToNumber(pricing?.price?.gross?.amount)}`}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                        {state.hasNextPage && (
                                            <div className="flex w-full justify-center">
                                                <button
                                                    onClick={state.search == '' ? loadMoreProducts : loadMoreSearchProduct}
                                                    className="rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-500 hover:border-transparent hover:bg-blue-500 hover:text-white"
                                                >
                                                    {productLoadMoreLoading ? <IconLoader /> : 'Load More'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Button section */}
                                <div className="mb-5 flex flex-col items-center gap-5 pt-1">
                                    {/* Load More Button */}

                                    {/* Action Buttons */}
                                    <div className="flex w-full justify-end gap-3">
                                        <button
                                            onClick={() => {
                                                setState({ selectedItems: {}, addProductOpen: false, search: '' });
                                            }}
                                            className="rounded border border-black bg-transparent px-4 py-2 font-semibold text-black hover:border-transparent hover:bg-blue-500 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => addProducts()}
                                            className="rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-500 hover:border-transparent hover:bg-blue-500 hover:text-white"
                                        >
                                            {state.productLoading ? <IconLoader /> : 'Confirm'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            />

            <Modal
                edit={state.isOpenCoupen}
                addHeader={'Discount this Order by:'}
                updateHeader={'Discount this Order by:'}
                open={state.isOpenCoupen}
                close={() => setState({ isOpenCoupen: false })}
                renderComponent={() => (
                    <>
                        <div className=" p-3">
                            <div className="flex items-center justify-center gap-5">
                                <div className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="radio"
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        checked={state.coupenOption === 'percentage'}
                                        onChange={() => setState({ ...state, coupenOption: 'percentage' })}
                                    />
                                    <span onClick={() => setState({ ...state, coupenOption: 'percentage' })}>Percentage</span>
                                </div>
                                <div className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="radio"
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        checked={state.coupenOption === 'fixed'}
                                        onChange={() => setState({ ...state, coupenOption: 'fixed' })}
                                    />
                                    <span onClick={() => setState({ coupenOption: 'fixed' })}>Fixed Amount</span>
                                </div>
                            </div>
                            {couponOptionErrMsg && <div className="text-red-500">{couponOptionErrMsg}</div>}
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    className="form-input mt-4"
                                    value={state.coupenOption === 'percentage' ? state.percentcoupenValue : state.fixedcoupenValue}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setState({
                                            percentcoupenValue: state.coupenOption === 'percentage' ? value : state.percentcoupenValue,
                                            fixedcoupenValue: state.coupenOption === 'fixed' ? value : state.fixedcoupenValue,
                                        });
                                    }}
                                />
                                <span className="pt-5">{state.coupenOption === 'percentage' ? '%' : productDetails?.order?.total?.gross?.currency}</span>
                            </div>
                            {precentageErrMsg && <div className="mt-1 text-red-500">{precentageErrMsg}</div>}
                            {fixedErrMsg && <div className="mt-1 text-red-500">{fixedErrMsg}</div>}{' '}
                            <div className="mt-5 flex justify-end gap-5">
                                <button
                                    className="rounded border border-black bg-transparent px-4 py-2 font-semibold text-black hover:border-transparent hover:bg-blue-500 hover:text-white"
                                    onClick={() => setState({ isOpenCoupen: false })}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        // if (productDetails?.order?.discounts?.length > 0) {
                                        //     updateDiscount();
                                        // } else {
                                        addDiscount();
                                        // }
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
        </>
    );
};

export default PrivateRouter(NewOrder);
