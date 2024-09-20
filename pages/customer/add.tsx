import IconLoader from '@/components/Icon/IconLoader';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import { ADD_CUSTOMER, COUNTRY_LIST, STATES_LIST } from '@/query/product';
import { Failure, Success, uniqueStateAddress, useSetState } from '@/utils/functions';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import * as Yup from 'yup';

const Add = () => {
    const router = useRouter();
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
    });

    const { data: countryData } = useQuery(COUNTRY_LIST);
    const [addCustomer] = useMutation(ADD_CUSTOMER);
    const { data: stateData, refetch: countryAreaRefetch } = useQuery(STATES_LIST);

    const validationSchema = Yup.object().shape({
        firstName: Yup.string().required('First name is required'),
        lastName: Yup.string().required('Last name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        pFirstName: Yup.string().required('Primary first name is required'),
        pLastName: Yup.string().required('Primary last name is required'),
        // company: Yup.string().required('Company name is required'),
        phone: Yup.string()
            .required('Phone number is required')
            .matches(/^\d{10}$/, 'Phone number is not valid'),
        address1: Yup.string().required('Address line 1 is required'),
        city: Yup.string().required('City is required'),
        postalCode: Yup.string().required('Postal code is required'),
        country: Yup.string().required('Country is required'),
        countryArea: Yup.string().required('Country area is required'),
    });

    useEffect(() => {
        getCountryList();
    }, [countryData]);

    const getCountryList = () => {
        setState({ loading: true });
        if (countryData) {
            if (countryData.shop && countryData.shop.countries.length > 0) {
                setState({ loading: false, countryList: countryData.shop.countries });
            } else {
                setState({ loading: false });
            }
        } else {
            setState({ loading: false });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setState({
            [name]: value,
        });
    };

    const validateForm = async () => {
        try {
            await validationSchema.validate(state, { abortEarly: false });
            setState({ errors: {} });
            return true;
        } catch (err) {
            const errors = {};
            err.inner.forEach((error) => {
                errors[error.path] = error.message;
            });
            setState({ errors });
            return false;
        }
    };

    const createCustomer = async () => {
        if (await validateForm()) {
            try {
                const address = {
                    city: state.city,
                    cityArea: '',
                    companyName: state.company,
                    country: state.country,
                    countryArea: state.countryArea,
                    firstName: state.pFirstName,
                    lastName: state.pLastName,
                    phone: state.phone,
                    postalCode: state.postalCode,
                    streetAddress1: state.address1,
                    streetAddress2: state.address2,
                };

                const res = await addCustomer({
                    variables: {
                        input: {
                            defaultBillingAddress: address,
                            defaultShippingAddress: address,
                            email: state.email,
                            firstName: state.firstName,
                            lastName: state.lastName,
                            note: '',
                        },
                    },
                });

                if (res.data?.customerCreate?.errors?.length > 0) {
                    Failure(res.data.customerCreate.errors[0].message);
                } else {
                    router.push('/customer/customer');
                    Success('Customer created successfully');
                }
            } catch (error) {
                console.log('error: ', error);
            }
        }
    };

    return (
        <>
            <div className="panel mb-5 flex items-center justify-between gap-3 p-5">
                <h3 className="text-lg font-semibold dark:text-white-light">Add Customer</h3>
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
                    <input type="text" className={`form-input ${state.errors.lastName && 'border border-danger focus:border-danger'}`} name="lastName" value={state.lastName} onChange={handleChange} />
                    {state.errors.lastName && <div className="mt-1 text-danger">{state.errors.lastName}</div>}
                </div>
                <div className="col-span-6">
                    <label htmlFor="email" className=" text-sm font-medium text-gray-700">
                        Email address
                    </label>
                    <input type="text" className={`form-input ${state.errors.email && 'border border-danger focus:border-danger'}`} name="email" value={state.email} onChange={handleChange} />
                    {state.errors.email && <div className="mt-1 text-danger">{state.errors.email}</div>}
                </div>
            </div>
            <div className="mt-4">
                <label htmlFor="firstname" className="text-lg font-bold text-gray-700">
                    Primary Address
                </label>
            </div>
            <div className="panel mt-5 grid grid-cols-12 gap-3">
                <div className="col-span-6">
                    <label htmlFor="pFirstName" className=" text-sm font-medium text-gray-700">
                        First Name
                    </label>
                    <input
                        type="text"
                        className={`form-input ${state.errors.pFirstName && 'border border-danger focus:border-danger'}`}
                        name="pFirstName"
                        value={state.pFirstName}
                        onChange={handleChange}
                    />
                    {state.errors.pFirstName && <div className="mt-1 text-danger">{state.errors.pFirstName}</div>}
                </div>
                <div className="col-span-6">
                    <label htmlFor="pLastName" className=" text-sm font-medium text-gray-700">
                        Last Name
                    </label>
                    <input
                        type="text"
                        className={`form-input ${state.errors.pLastName && 'border border-danger focus:border-danger'}`}
                        name="pLastName"
                        value={state.pLastName}
                        onChange={handleChange}
                    />
                    {state.errors.pLastName && <div className="mt-1 text-danger">{state.errors.pLastName}</div>}
                </div>
                <div className="col-span-6">
                    <label htmlFor="company" className=" text-sm font-medium text-gray-700">
                        Company
                    </label>
                    <input type="text" className={`form-input ${state.errors.company && 'border border-danger focus:border-danger'}`} name="company" value={state.company} onChange={handleChange} />
                    {state.errors.company && <div className="mt-1 text-danger">{state.errors.company}</div>}
                </div>
                <div className="col-span-6">
                    <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                        Phone
                    </label>
                    <input
                        type="number"
                        className={`form-input ${state.errors.phone && 'border border-danger focus:border-danger'}`}
                        name="phone"
                        value={state.phone}
                        maxLength={10}
                        onChange={handleChange}
                    />
                    {state.errors.phone && <div className="mt-1 text-danger">{state.errors.phone}</div>}
                </div>
                <div className="col-span-6">
                    <label htmlFor="addressline1" className=" text-sm font-medium text-gray-700">
                        Address Line 1
                    </label>
                    <input type="text" className={`form-input ${state.errors.address1 && 'border border-danger focus:border-danger'}`} name="address1" value={state.address1} onChange={handleChange} />
                    {state.errors.address1 && <div className="mt-1 text-danger">{state.errors.address1}</div>}
                </div>
                <div className="col-span-6">
                    <label htmlFor="addressline2" className=" text-sm font-medium text-gray-700">
                        Address Line 2
                    </label>
                    <input type="text" className={`form-input ${state.errors.address2 && 'border border-danger focus:border-danger'}`} name="address2" value={state.address2} onChange={handleChange} />
                    {state.errors.address2 && <div className="mt-1 text-danger">{state.errors.address2}</div>}
                </div>
                <div className="col-span-6">
                    <label htmlFor="city" className=" text-sm font-medium text-gray-700">
                        City
                    </label>
                    <input type="text" className={`form-input ${state.errors.city && 'border border-danger focus:border-danger'}`} name="city" value={state.city} onChange={handleChange} />
                    {state.errors.city && <div className="mt-1 text-danger">{state.errors.city}</div>}
                </div>
                <div className="col-span-6">
                    <label htmlFor="pincode" className=" text-sm font-medium text-gray-700">
                        Post Code / ZIP
                    </label>
                    <input
                        type="number"
                        className={`form-input ${state.errors.postalCode && 'border border-danger focus:border-danger'}`}
                        name="postalCode"
                        value={state.postalCode}
                        onChange={handleChange}
                    />
                    {state.errors.postalCode && <div className="mt-1 text-danger">{state.errors.postalCode}</div>}
                </div>
                <div className="col-span-6">
                    <label htmlFor="country" className=" text-sm font-medium text-gray-700">
                        Country / Region
                    </label>
                    <select
                        className={`form-select mr-3 ${state.errors.country && 'border border-danger focus:border-danger'}`}
                        id="billingcountry"
                        name="country"
                        value={state.country}
                        onChange={async (e) => {
                            handleChange(e);
                            const selectedCountryCode = e.target.value;
                            const selectedCountry = state.countryList.find((country) => country.code === selectedCountryCode);
                            if (selectedCountry) {
                                setState({ country: selectedCountry.code });
                            }
                            const res = await countryAreaRefetch({
                                code: selectedCountry.code,
                            });
                            const response = uniqueStateAddress(res?.data?.addressValidationRules?.countryAreaChoices);

                            setState({ countryAreaList: response });
                        }}
                    >
                        <option value={''}>Select country</option>
                        {state.countryList.map((item) => (
                            <option key={item.code} value={item.code}>
                                {item.country}
                            </option>
                        ))}
                    </select>
                    {state.errors.country && <div className="mt-1 text-danger">{state.errors.country}</div>}
                </div>
                <div className="col-span-6">
                    <label htmlFor="state" className=" text-sm font-medium text-gray-700">
                        State / Country
                    </label>
                    <select
                        className={`form-select mr-3 ${state.errors.countryArea && 'border border-danger focus:border-danger'}`}
                        id="countryArea"
                        name="countryArea"
                        value={state.countryArea}
                        onChange={handleChange}
                    >
                        <option value={''}>Select countryArea</option>
                        {state.countryAreaList.map((item) => (
                            <option key={item.raw} value={item.raw}>
                                {item.raw}
                            </option>
                        ))}
                    </select>
                    {state.errors.countryArea && <div className="mt-1 text-danger">{state.errors.countryArea}</div>}
                </div>
                <div>
                    <button type="button" className="btn btn-primary w-[100px]" onClick={createCustomer}>
                        Submit
                    </button>
                </div>
            </div>
        </>
    );
};

export default PrivateRouter(Add);
