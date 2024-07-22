import React, { useEffect, useRef, useState } from 'react';
import { Modal, Select } from 'antd';
import { useMutation, useQuery } from '@apollo/client';
import { COUNTRY_LIST, CREATE_CUSTOMER_ADDRESS, CUSTOMER_ADDRESS, DELETE_CUSTOMER_ADDRESS, SET_DEFAULT_ADDRESS, STATE_LIST, UPDATE_CUSTOMER_ADDRESS } from '@/query/product';
import { Failure, Success, objIsEmpty, useSetState } from '@/utils/functions';
import IconSettings from '@/components/Icon/IconSettings';
import { useRouter } from 'next/router';
import IconLoader from '@/components/Icon/IconLoader';
import PrivateRouter from '@/components/Layouts/PrivateRouter';

const Address=()=> {
    const router = useRouter();
    const { id } = router.query;
    const [showSettingsBox, setShowSettingsBox] = useState(null);
    const [editAddressModalVisible, setEditAddressModalVisible] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);

    const [state, setState] = useSetState({
        addressData: {},
        selectedAddress: {},
        index: '',
        errors: {},
        isOpen: false,
        newAddressLoader: false,
        countryAreaList: [],
        firstName: '',
        lastName: '',
        phone: '',
        streetAddress1: '',
        streetAddress2: '',
        city: '',
        postalCode: '',
        updateLoading: false,
        companyName: '',
    });

    const dropdownRef = useRef(null);

    const { data: data, refetch: getAddressRefetch } = useQuery(CUSTOMER_ADDRESS);

    const [setDefaultAddress] = useMutation(SET_DEFAULT_ADDRESS);
    const [removeAddress] = useMutation(DELETE_CUSTOMER_ADDRESS);
    const { data: countryList } = useQuery(COUNTRY_LIST);
    const [createAddress] = useMutation(CREATE_CUSTOMER_ADDRESS);
    const [editAddress] = useMutation(UPDATE_CUSTOMER_ADDRESS);

    const { data: countryAreaList, refetch: countryAreaRefetch } = useQuery(STATE_LIST);

    const CountryList = countryList?.shop?.countries;

    useEffect(() => {
        getAddress();
    }, [data]);

    const getAddress = async () => {
        try {
            const res = await getAddressRefetch({
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
            });
            setState({ addressData: res?.data?.user });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    // useEffect(() => {
    //     function handleClickOutside(event: MouseEvent) {
    //         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
    //             setState({ index: null });
    //         }
    //     }

    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => {
    //         document.removeEventListener('mousedown', handleClickOutside);
    //     };
    // }, [dropdownRef]);

    const handleSettingsClick = (index: number) => {
        if (state.index === index) {
            // If the clicked index is the same as the selected one, toggle it off
            setState({ index: null });
        } else {
            // Otherwise, set the selected index to the clicked one
            setState({ index });
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setState({ ...state, [name]: value });
    };

    const handleCountryChange = (value: any) => {
        setState({ ...state, country: value });
    };

    const handleStateChange = (value: any) => {
        setState({ ...state, countryArea: value });
    };

    const setDefaultBillingAddress = async (addressId: any) => {
        try {
            const res = await setDefaultAddress({
                variables: { addressId, type: 'BILLING', userId: id },
            });
            if (res?.data?.addressSetDefault?.errors?.length > 0) {
            } else {
                Success('Billing Address Updated');
            }
            setState({ index: null });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const setDefaultShippingAddress = async (addressId: any) => {
        try {
            const res = await setDefaultAddress({
                variables: { addressId, type: 'SHIPPING', userId: id },
            });
            if (res?.data?.addressSetDefault?.errors?.length > 0) {
            } else {
                Success('Shipping Address Updated');
            }
            setState({ index: null });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const deleteAddress = async (id: any) => {
        try {
            const res = await removeAddress({
                variables: { id },
            });
            if (res?.data?.addressDelete?.errors?.length > 0) {
            } else {
                setState({ index: null });

                getAddress();
                Success('Address Deleted Successfully');
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const addAddress = async () => {
        try {
            setState({ updateLoading: true });
            const res = await createAddress({
                variables: {
                    id,
                    input: {
                        city: state.city,
                        cityArea: '',
                        companyName: state.companyName,
                        country: state.country,
                        countryArea: state.countryArea,
                        firstName: state.firstName,
                        lastName: state.lastName,
                        phone: state.phone,
                        postalCode: state.postalCode,
                        streetAddress1: state.streetAddress1,
                        streetAddress2: state.streetAddress1,
                    },
                },
            });
            if (res?.data?.addressCreate?.errors?.length > 0) {
                Failure(res?.data?.addressCreate?.errors[0]?.message);
                setState({ updateLoading: false });
            } else {
                getAddress();
                Success('Address Added Successfully');
                setState({ index: null, isOpen: false, updateLoading: false });
            }
        } catch (error) {
            setState({ updateLoading: false });

            console.log('error: ', error);
        }
    };

    const updateAddress = async () => {
        try {
            setState({ updateLoading: true });

            const res = await editAddress({
                variables: {
                    id: state.selectedAddress?.id,
                    input: {
                        city: state.city,
                        cityArea: '',
                        companyName: state.companyName,
                        country: state.country,
                        countryArea: state.countryArea,
                        firstName: state.firstName,
                        lastName: state.lastName,
                        phone: state.phone,
                        postalCode: state.postalCode,
                        streetAddress1: state.streetAddress1,
                        streetAddress2: state.streetAddress1,
                    },
                },
            });
            if (res?.data?.addressUpdate?.errors?.length > 0) {
                Failure(res?.data?.addressUpdate?.errors[0]?.message);
                setState({ updateLoading: false });
            } else {
                getAddress();
                Success('Address Updated Successfully');
                setState({ index: null, isOpen: false, updateLoading: false });
            }
        } catch (error) {
            setState({ updateLoading: false });

            console.log('error: ', error);
        }
    };

    return (
        <div>
            <div className="panel mb-5 flex items-center justify-between gap-3 p-5 ">
                <h3 className="text-lg font-semibold dark:text-white-light">Address Info</h3>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() =>
                        setState({
                            isOpen: true,
                            selectedAddress: {},
                            firstName: '',
                            lastName: '',
                            phone: '',
                            streetAddress1: '',
                            streetAddress2: '',
                            city: '',
                            countryArea: '',
                            postalCode: '',
                            country: '',
                            countryAreaList: [],
                            companyName: '',
                        })
                    }
                >
                    {'Add Address'}
                </button>
            </div>
            <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {state.addressData?.addresses?.length > 0 &&
                    state.addressData?.addresses.map((address: any, index: number) => (
                        <div
                            key={index}
                            className="grid-item"
                            style={{
                                marginBottom: '10px',
                                // border: '1px solid #ccc',
                                borderRadius: '10px',
                                padding: '15px',
                                background: address?.isDefaultBillingAddress || address?.isDefaultShippingAddress ? '#ffe3be' : 'white',
                            }}
                        >
                            {state.addressData?.defaultBillingAddress?.id == address?.id && <div className=" text-lg font-bold text-black">Default Billing Address</div>}
                            {state.addressData?.defaultShippingAddress?.id == address?.id && <div className=" text-lg font-bold text-black">Default Shipping Address</div>}

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div>
                                    {address?.isDefaultBillingAddress && <h5 style={{ color: 'black', fontWeight: '500' }}>Default Billing Address</h5>}
                                    {address?.isDefaultShippingAddress && <h5 style={{ color: 'black', fontWeight: '500' }}>Default Shipping Address</h5>}
                                    <p style={{ color: 'gray', marginBottom: '0px' }}>
                                        {address.firstName} {address.lastName}
                                    </p>
                                    <p style={{ color: 'gray', marginBottom: '0px' }}>{address.phone}</p>
                                    <p style={{ color: 'gray', marginBottom: '0px' }}>{address.companyName}</p>
                                    <p style={{ color: 'gray', marginBottom: '0px' }}>{address.email}</p>
                                    <p style={{ color: 'gray', marginBottom: '0px' }}>
                                        {address.streetAddress1} {address.streetAddress2}
                                    </p>
                                    <p style={{ color: 'gray', marginBottom: '0px' }}>{address.city}</p>
                                    <p style={{ color: 'gray', marginBottom: '0px' }}>{address.countryArea}</p>
                                    <p style={{ color: 'gray', marginBottom: '0px' }}>{address.country?.country}</p>
                                </div>
                                <div style={{ textAlign: 'right' }} ref={dropdownRef}>
                                    <button
                                        onClick={() => {
                                            handleSettingsClick(index);
                                            setState({ selectedAddress: address });
                                        }}
                                    >
                                        <IconSettings />
                                    </button>
                                    {state.index === index && (
                                        <div
                                            style={{
                                                backgroundColor: '#c2882b',
                                                padding: '10px',
                                                borderRadius: '5px',
                                                color: 'white',
                                            }}
                                        >
                                            <ul
                                                style={{
                                                    listStyle: 'none',
                                                    padding: '0px',
                                                    margin: '0px',
                                                    textAlign: 'left',
                                                }}
                                            >
                                                <li
                                                    style={{
                                                        cursor: 'pointer',
                                                        paddingBottom: '10px',
                                                        lineHeight: '20px',
                                                        fontWeight: '500',
                                                    }}
                                                    onClick={() => setDefaultBillingAddress(address?.id)}
                                                >
                                                    Set as Default Billing Address
                                                </li>
                                                <li
                                                    style={{
                                                        cursor: 'pointer',
                                                        paddingBottom: '10px',
                                                        lineHeight: '20px',
                                                        fontWeight: '500',
                                                    }}
                                                    onClick={() => setDefaultShippingAddress(address?.id)}

                                                    // onClick={() => handleSettingDefaultShippingClick(address)}
                                                >
                                                    Set as Default Shipping Address
                                                </li>
                                                <li
                                                    style={{
                                                        cursor: 'pointer',
                                                        paddingBottom: '10px',
                                                        lineHeight: '20px',
                                                        fontWeight: '500',
                                                    }}
                                                    onClick={async () => {
                                                        const res = await countryAreaRefetch({
                                                            code: address?.country?.code,
                                                        });

                                                        const filter = res?.data?.addressValidationRules?.countryAreaChoices?.find((item: any) => item.raw == address?.countryArea);

                                                        setState({
                                                            isOpen: true,
                                                            firstName: address.firstName,
                                                            lastName: address.lastName,
                                                            phone: Number(address.phone),
                                                            streetAddress1: address?.streetAddress1,
                                                            streetAddress2: address?.streetAddress2,
                                                            city: address?.city,
                                                            countryArea: filter?.raw,
                                                            postalCode: Number(address?.postalCode),
                                                            country: address?.country?.code,
                                                            countryAreaList: res?.data?.addressValidationRules?.countryAreaChoices,
                                                            companyName: address?.companyName,
                                                        });
                                                    }}
                                                >
                                                    Edit Address
                                                </li>
                                                <li
                                                    style={{
                                                        cursor: 'pointer',
                                                        lineHeight: '18px',
                                                        fontWeight: '500',
                                                    }}
                                                    onClick={() => deleteAddress(address?.id)}
                                                >
                                                    Delete Address
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Edit Address Modal */}
            <Modal
                title={objIsEmpty(state.selectedAddress) ? 'Add Address' : 'Edit Address'}
                visible={state.isOpen}
                onCancel={() => setState({ isOpen: false })}
                footer={null} // Remove footer if you don't need buttons
            >
                <form className="flex flex-col gap-4">
                    <div className="profile__input-box col-md-6 ">
                        <div className="profile__input">
                          

                            <input name="firstName" type="text" className="form-input" placeholder="Enter your first name" value={state.firstName} onChange={handleChange} />
                            {state.errors.firstName && <p className="error-message mt-1 text-red-500">{state.errors.firstName}</p>}
                        </div>
                    </div>
                    <div className="profile__input-box col-md-6">
                        <div className="profile__input">
                            <input name="lastName" type="text" className="form-input" placeholder="Enter your last name" value={state.lastName} onChange={handleChange} />
                            {state.errors.lastName && <p className="error-message mt-1 text-red-500">{state.errors.lastName}</p>}
                        </div>
                    </div>
                    <div className="profile__input-box">
                        <div className="profile__input">
                            <input name="companyName" type="text" className="form-input" placeholder="Enter your companyName" value={state.companyName} onChange={handleChange} />
                            {state.errors.companyName && <p className="error-message mt-1 text-red-500">{state.errors.companyName}</p>}
                        </div>
                    </div>
                    <div className="profile__input-box">
                        <div className="profile__input">
                            <input name="phone" type="number" className="form-input" placeholder="Enter your phone number" value={state.phone} onChange={handleChange} />
                            {state.errors.phone && <p className="error-message mt-1 text-red-500">{state.errors.phone}</p>}
                        </div>
                    </div>

                    <div className="profile__input-box">
                        <div className="profile__input">
                            <input name="streetAddress1" type="text" className="form-input" placeholder="Enter your address1" value={state.streetAddress1} onChange={handleChange} />
                            {state.errors.streetAddress1 && <p className="error-message mt-1 text-red-500">{state.errors.streetAddress1}</p>}
                        </div>
                    </div>
                    <div className="profile__input-box">
                        <div className="profile__input">
                            <input name="streetAddress2" type="text" className="form-input" placeholder="Enter your address2" value={state.streetAddress2} onChange={handleChange} />
                            {state.errors.streetAddress2 && <p className="error-message mt-1 text-red-500">{state.errors.streetAddress2}</p>}
                        </div>
                    </div>
                    <div className="profile__input-box col-md-6">
                        <div className="profile__input">
                            <input name="city" type="text" className="form-input" placeholder="Enter your city" value={state.city} onChange={handleChange} />
                            {state.errors.city && <p className="error-message mt-1 text-red-500">{state.errors.city}</p>}
                        </div>
                    </div>
                    <div className="profile__input-box col-md-6">
                        <div className="profile__input">
                            <input name="postalCode" type="number" className="form-input" placeholder="Enter your postal code" value={state.postalCode} onChange={handleChange} />
                            {state.errors.postalCode && <p className="error-message mt-1 text-red-500">{state.errors.postalCode}</p>}
                        </div>
                    </div>
                    <div className="col-span-6">
                        <label htmlFor="country" className=" text-sm font-medium text-gray-700">
                            Country / Region
                        </label>
                        <select
                            className={`form-select mr-3 ${state.errors.country && 'border border-danger focus:border-danger'}`}
                            // className="form-select mr-3"
                            id="billingcountry"
                            name="country"
                            value={state.country}
                            onChange={async (e) => {
                                handleChange(e);
                                const selectedCountryCode = e.target.value;
                                const selectedCountry: any = CountryList.find((country: any) => country.code === selectedCountryCode);
                                if (selectedCountry) {
                                    setState({ country: selectedCountry.code });
                                    // setSelectedCountry(selectedCountry.country);
                                }
                                const res = await countryAreaRefetch({
                                    code: selectedCountry.code,
                                });

                                setState({ countryAreaList: res?.data?.addressValidationRules?.countryAreaChoices });
                            }}
                        >
                            <option value={''}>Select country</option>

                            {CountryList?.map((item: any) => (
                                <option key={item.code} value={item.code}>
                                    {item.country}
                                </option>
                            ))}
                        </select>
                        {state.errors.country && <div className="mt-1 text-danger">{state.errors.country}</div>}
                    </div>

                    <div className="col-span-6">
                        <label htmlFor="country" className=" text-sm font-medium text-gray-700">
                            CountryArea
                        </label>
                        <select
                            className={`form-select mr-3 ${state.errors.country && 'border border-danger focus:border-danger'}`}
                            // className="form-select mr-3"
                            id="billingcountry"
                            name="country"
                            value={state.countryArea}
                            onChange={async (e) => {
                                // handleChange(e);
                                setState({ countryArea: e.target.value });
                            }}
                            // value={selectedCountry}
                            // onChange={(e) => getStateList(e.target.value)}
                        >
                            <option value={''}>Select country area</option>

                            {state.countryAreaList?.map((item: any) => (
                                <option key={item.raw} value={item.raw}>
                                    {item.raw}
                                </option>
                            ))}
                        </select>
                        {state.errors.country && <div className="mt-1 text-danger">{state.errors.country}</div>}
                    </div>

                    <div className="mt-8 flex items-center justify-end">
                        <button
                            type="button"
                            className="btn btn-outline-danger gap-2"
                            onClick={() =>
                                setState({
                                    isOpen: false,
                                    selectedAddress: {},
                                    firstName: '',
                                    lastName: '',
                                    phone: '',
                                    streetAddress1: '',
                                    streetAddress2: '',
                                    city: '',
                                    countryArea: '',
                                    postalCode: '',
                                    country: '',
                                    countryAreaList: [],
                                })
                            }
                        >
                            Cancel
                        </button>
                        <button type="button" onClick={() => (objIsEmpty(state.selectedAddress) ? addAddress() : updateAddress())} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                            {state.updateLoading ? <IconLoader /> : 'Confirm'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
export default PrivateRouter(Address);
