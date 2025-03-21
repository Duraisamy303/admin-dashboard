import IconLoader from '@/components/Icon/IconLoader';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import { ADD_CUSTOMER, COUNTRY_LIST, CUSTOMER_DETAILS, RESET_PASSWORD, STATES_LIST, UPDATE_CUSTOMER } from '@/query/product';
import { Failure, Success, useSetState } from '@/utils/functions';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import * as Yup from 'yup';
import CommonLoader from '../elements/commonLoader';

const Edit = () => {
    const router = useRouter();
    const { id } = router.query;
    const [state, setState] = useSetState({
        firstName: '',
        lastName: '',
        email: '',
        pFirstName: '',
        pLastName: '',
        company: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        postalCode: '',
        country: '',
        loading: false,
        countryList: [],
        errors: {},
        countryArea: '',
        countryAreaList: [],
        billingAddress: {
            firstName: '',
            lastName: '',
            email: '',
            companyName: '',
            streetAddress1: '',
            streetAddress2: '',
            city: '',
            countryArea: '',
            postalCode: '',
            phone: '',
            cityArea: '',
            country: '',
        },
        shippingAddress: {
            firstName: '',
            lastName: '',
            email: '',
            companyName: '',
            streetAddress1: '',
            streetAddress2: '',
            city: '',
            countryArea: '',
            postalCode: '',
            phone: '',
            cityArea: '',
            country: '',
        },
        manageLoading: false,
    });

    const { data: countryData } = useQuery(COUNTRY_LIST);
    const { data: customerData, loading: getDetailsLoading } = useQuery(CUSTOMER_DETAILS, {
        variables: {
            id,
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

    const [updateCustomers] = useMutation(UPDATE_CUSTOMER);
    const [passwordReset] = useMutation(RESET_PASSWORD);

    const { data: stateData, refetch: countryAreaRefetch } = useQuery(STATES_LIST);

    const validationSchema = Yup.object().shape({
        firstName: Yup.string().required('First name is required'),
        lastName: Yup.string().required('Last name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        // Add more field validations as required
    });

    useEffect(() => {
        getCountryList();
    }, [countryData]);

    useEffect(() => {
        getCustomerData();
    }, [customerData]);

    const getCountryList = () => {
        if (countryData) {
            if (countryData && countryData?.shop && countryData?.shop?.countries?.length > 0) {
                setState({ loading: false, countryList: countryData?.shop?.countries });
            } else {
                setState({ loading: false });
            }
        } else {
            setState({ loading: false });
        }
    };

    const getCustomerData = async () => {
        if (customerData) {
            if (customerData && customerData?.user) {
                const data = customerData?.user;
                const billing = data?.defaultBillingAddress;
                const shipping = data?.defaultShippingAddress;

                // if (billing) {
                //     const res = await countryAreaRefetch({
                //         code: billing?.country?.code,
                //     });
                //     setState({
                //         countryAreaList: res?.data?.addressValidationRules?.countryAreaChoices,
                //         billingAddress: { ...billing, countryArea: billing?.countryArea },
                //     });
                // }

                // if (shipping) {
                // const res = await countryAreaRefetch({
                //     code: shipping?.country?.code,
                // });
                // setState({
                //     countryAreaList: res?.data?.addressValidationRules?.countryAreaChoices,
                //     shippingAddress: { ...shipping, countryArea: res?.data?.addressValidationRules?.countryAreaChoices },
                // });
                // }
                setState({
                    firstName: data?.firstName,
                    lastName: data?.lastName,
                    email: data?.email,
                    billingAddress: { ...billing, country: billing?.country?.country },
                    shippingAddress: { ...shipping, country: shipping?.country?.country },
                });
            } else {
                setState({ loading: false });
            }
        } else {
            setState({ loading: false });
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setState({
            [name]: value,
        });
        // Yup.reach(validationSchema, name)
        //     .validate(value)
        //     .then(() => {
        //         // No validation error, clear the error message
        //         setState((prevState: any) => ({
        //             ...prevState,
        //             errors: {
        //                 ...prevState.errors,
        //                 [name]: '',
        //             },
        //         }));
        //     })
        //     .catch((error: any) => {
        //         // Validation error, set the error message
        //         setState((prevState: any) => ({
        //             ...prevState,
        //             errors: {
        //                 ...prevState.errors,
        //                 [name]: error.message,
        //             },
        //         }));
        //     });
    };

    const updateCustomer = async () => {
        try {
            setState({ updateLoading: true });
            const res = await updateCustomers({
                variables: {
                    id,
                    input: {
                        email: state.email,
                        firstName: state.firstName,
                        lastName: state.lastName,
                        note: '',
                        isActive: true,
                    },
                },
            });
            if (res.data?.customerUpdate?.errors?.length > 0) {
                setState({ updateLoading: false });
                Failure(res.data?.customerUpdate?.errors[0]?.message);
            } else {
                // router.push('/customer/customer');
                Success('Customer update successfully');
                setState({ updateLoading: false });
            }
        } catch (error) {
            setState({ updateLoading: false });

            // Failure(error);
            console.log('error: ', error);
        }
    };

    const resetPassword = async () => {
        try {
            setState({ passwordLoader: true });
            const res = await passwordReset({
                variables: { email: state.email },
            });
            if (res?.data?.passwordReset?.message) {
                Success(res?.data?.passwordReset?.message);
            }
            setState({ passwordLoader: false });
        } catch (error) {
            setState({ passwordLoader: false });

            console.log('error: ', error);
        }
    };

    return (
        <>
            {getDetailsLoading ? (
                <CommonLoader />
            ) : (
                <>
                    <div className="panel mb-5 flex items-center justify-between gap-3 p-5 ">
                        <h3 className="text-lg font-semibold dark:text-white-light">Update Customer</h3>
                        <button type="button" className="btn btn-primary" onClick={() => resetPassword()}>
                            {state.passwordLoader ? <IconLoader /> : 'Reset Password'}
                        </button>
                    </div>
                    <div className="panel mt-5 grid grid-cols-12 gap-3">
                        <div className="col-span-6">
                            <label htmlFor="firstname" className=" text-sm font-medium text-gray-700">
                                First Name
                            </label>

                            <input type="text" className={`form-input`} name="firstName" value={state.firstName} onChange={handleChange} />
                            {state.errors.firstName && <div className="mt-1 text-danger">{state.errors.firstName}</div>}
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="Lastname" className=" text-sm font-medium text-gray-700">
                                Last Name
                            </label>
                            <input
                                type="text"
                                className={`form-input ${state.errors.lastName && 'border border-danger focus:border-danger'}`}
                                name="lastName"
                                value={state.lastName}
                                onChange={handleChange}
                            />
                            {state.errors.lastName && <div className="mt-1 text-danger">{state.errors.lastName}</div>}
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="email" className=" text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                type="text"
                                disabled
                                className={`form-input ${state.errors.email && 'border border-danger focus:border-danger'}`}
                                name="email"
                                value={state.email}
                                onChange={handleChange}
                            />
                            {state.errors.email && <div className="mt-1 text-danger">{state.errors.email}</div>}
                            {/* <input type="mail" className="form-input" name="billing.email" value={formData.billing.email} onChange={handleChange} /> */}

                            {/* <input type="mail" id="billingemail" name="billingemail" className="form-input" required /> */}
                        </div>
                        <div className="col-span-12 ">
                            <button type="button" className="btn btn-primary" onClick={() => updateCustomer()}>
                                {state.updateLoading ? <IconLoader /> : 'Update'}
                            </button>
                        </div>
                    </div>
                    <div className="gap-3">
                        <div className="flex flex-wrap">
                            <div className="flex flex-1 justify-around ">
                                <div className="mt-5">
                                    <label htmlFor="firstname" className="text-lg font-bold text-gray-700">
                                        Billing Address
                                    </label>
                                </div>
                                <div className="mt-5">
                                    <label htmlFor="firstname" className="text-lg font-bold text-gray-700">
                                        Shipping Address
                                    </label>
                                </div>
                            </div>
                            <div className="flex-initial pt-4">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setState({ manageLoading: true });
                                        router.push(`/customer/address?id=${id}`);
                                        setState({ manageLoading: false });
                                    }}
                                >
                                    {state.manageLoading ? <IconLoader /> : 'Manage'}
                                </button>
                            </div>
                        </div>
                        <div className="mt-5 flex flex-row gap-3">
                            <div className="flex-1">
                                <div className="panel h-full gap-3">
                                    {state.billingAddress !== null && state.billingAddress?.country !== undefined ? (
                                        <div>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>
                                                {state.billingAddress?.firstName} {state.billingAddress?.lastName}
                                            </p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>{state.billingAddress?.phone}</p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>{state.billingAddress?.companyName}</p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>{state.billingAddress?.email}</p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>
                                                {state.billingAddress?.streetAddress1} {state.billingAddress?.streetAddress2}
                                            </p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>{state.billingAddress?.city}</p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>{state.billingAddress?.countryArea}</p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>{state.billingAddress?.country}</p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>{state.billingAddress?.postalCode}</p>
                                        </div>
                                    ) : (
                                        <div>No Address found</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="panel h-full gap-3">
                                    {state.shippingAddress !== null && state.shippingAddress?.country !== undefined ? (
                                        <div>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>
                                                {state.shippingAddress?.firstName} {state.shippingAddress?.lastName}
                                            </p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>{state.shippingAddress?.phone}</p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>{state.shippingAddress?.companyName}</p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>{state.shippingAddress?.email}</p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>
                                                {state.shippingAddress?.streetAddress1} {state.shippingAddress?.streetAddress2}
                                            </p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>{state.shippingAddress?.city}</p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>{state.shippingAddress?.countryArea}</p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>{state.shippingAddress?.country}</p>
                                            <p style={{ color: 'gray', marginBottom: '0px' }}>{state.shippingAddress?.postalCode}</p>
                                        </div>
                                    ) : (
                                        <div>No Address found</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default PrivateRouter(Edit);
