import * as Yup from 'yup';

export const billingValidation = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required'),
    company: Yup.string().required('Company is required'),
    address_1: Yup.string().required('Street address is required'),
    // address_2: Yup.string().required('Street address is required'),
    city: Yup.string().required('City is required'),
    pincode: Yup.string().required('Postal code is required'),
    state: Yup.string().required('State is required'),
    country: Yup.string().required('Country is required'),
    phone: Yup.string().required('Phone is required'),
    paymentMethod: Yup.string().required('PaymentMethod is required'),
    transactionId: Yup.string().required('TransactionId is required'),

    // Add validation for other billing address fields here
});
// shipping: Yup.object().shape({
//     firstName: Yup.string().required('First Name is required'),
//     lastName: Yup.string().required('Last Name is required'),
//     email: Yup.string().required('Email is required'),
//     company: Yup.string().required('Company is required'),
//     address_1: Yup.string().required('Street address is required'),
//     address_2: Yup.string().required('Street address is required'),
//     city: Yup.string().required('City is required'),
//     pincode: Yup.string().required('Postal code is required'),
//     state: Yup.string().required('State is required'),
//     country: Yup.string().required('Country is required'),
//     phone: Yup.string().required('Phone is required'),
//     paymentMethod: Yup.string().required('PaymentMethod is required'),
//     transactionId: Yup.string().required('TransactionId is required'),
// }),

export const AddressValidation = (state: any) => {
    let newBillingErrMsg: any = {};
    let newShippingErrMsg: any = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    const pincodeRegex = /^[0-9]{5,10}$/;

    const requiredFields = ['firstName', 'lastName',  'address_1',  'city', 'state', 'country'];

    requiredFields.forEach((field) => {
        if (!state?.billingAddress?.[field]) {
            newBillingErrMsg[field] = 'Required this field';
        }
        if (!state?.shippingAddress?.[field]) {
            newShippingErrMsg[field] = 'Required this field';
        }
    });

    if (!state?.billingAddress?.pincode) {
        newBillingErrMsg.pincode = 'Required this field';
    } else if (!pincodeRegex.test(state.billingAddress.pincode)) {
        newBillingErrMsg.pincode = 'Invalid pincode';
    }

    if (!state?.billingAddress?.phone) {
        newBillingErrMsg.phone = 'Required this field';
    } else if (!phoneRegex.test(state.billingAddress.phone)) {
        newBillingErrMsg.phone = 'Invalid phone number';
    }

    // if (!state?.billingAddress?.email) {
    //     newBillingErrMsg.email = 'Required this field';
    // } else if (!emailRegex.test(state.billingAddress.email)) {
    //     newBillingErrMsg.email = 'invalid email';
    // }

    if (!state?.shippingAddress?.pincode) {
        newShippingErrMsg.pincode = 'Required this field';
    } else if (!pincodeRegex.test(state.shippingAddress.pincode)) {
        newShippingErrMsg.pincode = 'invalid pincode';
    }

    if (!state?.shippingAddress?.phone) {
        newShippingErrMsg.phone = 'Required this field';
    } else if (!phoneRegex.test(state.shippingAddress.phone)) {
        newShippingErrMsg.phone = 'Invalid phone number';
    }

    // if (!state?.shippingAddress?.email) {
    //     newShippingErrMsg.email = 'Required this field';
    // } else if (!emailRegex.test(state.shippingAddress.email)) {
    //     newShippingErrMsg.email = 'invalid email';
    // }
    return { billingAddress: newBillingErrMsg, shippingAddress: newShippingErrMsg };
};
