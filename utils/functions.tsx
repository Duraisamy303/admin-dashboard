import { useState } from 'react';
import Swal from 'sweetalert2';
import placeholder from '../public/assets/images/placeholder.png';
import * as FileSaver from 'file-saver';
import XLSX from 'sheetjs-style';
import moment from 'moment';
import AWS from 'aws-sdk';

export const capitalizeFLetter = (string = '') => {
    if (string.length > 0) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    return string;
};

export const useSetState = (initialState: any) => {
    const [state, setState] = useState(initialState);

    const newSetState = (newState: any) => {
        setState((prevState: any) => ({ ...prevState, ...newState }));
    };
    return [state, newSetState];
};

export const getPrice = () => {
    let price;
};

export const shortData = (selectValue: any, products: any) => {
    if (!selectValue || !products?.length) {
        return null;
    }

    let product_items = [...products];

    if (selectValue === 'Low to High') {
        product_items.sort((a, b) => {
            const priceA = Number(a?.node?.pricing?.priceRange?.start?.gross?.amount) || 0;
            const priceB = Number(b?.node?.pricing?.priceRange?.start?.gross?.amount) || 0;
            return priceA - priceB;
        });
    } else if (selectValue === 'High to Low') {
        product_items.sort((a, b) => {
            const priceA = Number(a?.node?.pricing?.priceRange?.start?.gross?.amount) || 0;
            const priceB = Number(b?.node?.pricing?.priceRange?.start?.gross?.amount) || 0;
            return priceB - priceA;
        });
    } else if (selectValue === 'New Added') {
        product_items.sort((a, b) => {
            const dateA: any = new Date(a?.node?.created) || new Date();
            const dateB: any = new Date(b?.node?.created) || new Date();
            return dateB - dateA;
        });
    } else if (selectValue === 'On Sale') {
        product_items = products.filter((p: any) => p.node.pricing.discount > 0);
    }

    return product_items;
};

export const showDeleteAlert = (onConfirm: () => void, onCancel: () => void) => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-secondary',
            cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
            popup: 'sweet-alerts',
        },
        buttonsStyling: false,
    });

    swalWithBootstrapButtons
        .fire({
            title: 'Are you sure?',
            // text: "You won't be able to Delete this!",
            icon: 'warning',
            showCancelButton: true,
            // confirmButtonText: 'Yes, delete it!',
            // cancelButtonText: 'No, cancel!',
            reverseButtons: true,
            padding: '2em',
        })
        .then((result) => {
            if (result.isConfirmed) {
                onConfirm(); // Call the onConfirm function if the user confirms the deletion
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                onCancel(); // Call the onCancel function if the user cancels the deletion
            }
        });
};

export const Success = (message: string) => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        // Merge provided options with default options
    });

    toast.fire({
        icon: 'success',
        title: message,
        padding: '10px 20px',
    });
};

export const Failure = (message: string) => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        // Merge provided options with default options
    });

    toast.fire({
        icon: 'error',
        title: message,
        padding: '10px 20px',
    });
};

// export const checkChannel = () => {
//     let channel = '';
//     const channels = localStorage.getItem('channel');
//     if (!channels) {
//         channel = 'INR';
//     } else {
//         channel = channels;
//     }
//     return channel;
// };

export const sampleParams = {
    after: null,
    first: 100,
    query: '',
    channel: 'india-channel',
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
};

export const uploadImage = async (productId: any, file: any) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append(
            'operations',
            JSON.stringify({
                operationName: 'ProductMediaCreate',
                variables: { product: productId, alt: '', image: null },
                query: `mutation ProductMediaCreate($product: ID!, $image: Upload, $alt: String, $mediaUrl: String) {
                productMediaCreate(input: {alt: $alt, image: $image, product: $product, mediaUrl: $mediaUrl}) {
                    errors { ...ProductError }
                    product { id media { ...ProductMedia } }
                }
            }
            fragment ProductError on ProductError { code field message }
            fragment ProductMedia on ProductMedia { id alt sortOrder url(size: 1024) type oembedData }`,
            })
        );
        formData.append('map', JSON.stringify({ '1': ['variables.image'] }));
        formData.append('1', file);

        const response = await fetch('https://file.prade.in/graphql/', {
            method: 'POST',
            headers: {
                Authorization: `JWT ${token}`,
            },
            body: formData,
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};

export const duplicateUploadImage = async (productId, imageUrl) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append(
            'operations',
            JSON.stringify({
                operationName: 'ProductMediaCreate',
                variables: { product: productId, alt: '', mediaUrl: imageUrl },
                query: `mutation ProductMediaCreate($product: ID!, $alt: String, $mediaUrl: String) {
                    productMediaCreate(input: {alt: $alt, product: $product, mediaUrl: $mediaUrl}) {
                        errors { ...ProductError }
                        product { id media { ...ProductMedia } }
                    }
                }
                fragment ProductError on ProductError { code field message }
                fragment ProductMedia on ProductMedia { id alt sortOrder url(size: 1024) type oembedData }`,
            })
        );

        const response = await fetch('https://file.prade.in/graphql/', {
            method: 'POST',
            headers: {
                Authorization: `JWT ${token}`,
            },
            body: formData,
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};

export const categoryImageUpload = async (categoryId, imageUrl) => {
    console.log('categoryId, imageUrl: ', categoryId, imageUrl);
    try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        // Ensure the fileName has a valid extension
        const fileExtension = blob.type.split('/')[1];
        const fileName = `uploaded_image.${fileExtension}`;
        const file = new File([blob], fileName, { type: blob.type });
        const token = localStorage.getItem('token');
        const formData = new FormData();

        const operations = JSON.stringify({
            operationName: 'CategoryUpdate',
            variables: {
                id: categoryId,
                input: {
                    backgroundImage: null, // Placeholder for the file variable
                },
            },
            query: `mutation CategoryUpdate($id: ID!, $input: CategoryInput!) {
                categoryUpdate(id: $id, input: $input) {
                    category {
                        id
                        backgroundImage {
                            alt
                            url
                        }
                        name
                        slug
                        description
                        seoDescription
                        seoTitle
                        parent {
                            id
                        }
                    }
                    errors {
                        code
                        field
                        message
                    }
                }
            }`,
        });

        const map = JSON.stringify({
            '1': ['variables.input.backgroundImage'],
        });

        formData.append('operations', operations);
        formData.append('map', map);
        formData.append('1', file); // Append the actual file here

        const response = await fetch('https://file.prade.in/graphql/', {
            method: 'POST',
            headers: {
                Authorization: `JWT ${token}`,
            },
            body: formData,
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

export const getValueByKey = (metadata: any[], key: string) => {
    const item = metadata.find((item) => item.key === key);
    return item ? item.value : null;
};

export const isEmptyObject = (obj: any) => {
    return Object.values(obj).every((value) => value === '');
};

export const UserDropdownData = (shippingProvider: any) => {
    if (shippingProvider) {
        if (shippingProvider && shippingProvider?.search?.edges?.length > 0) {
            const dropdownData = shippingProvider?.search?.edges?.map((item: any) => ({
                value: item.node?.id,
                label: `${item?.node?.firstName} -${item?.node?.lastName}`,
            }));
            return dropdownData;
        } else {
        }
    }
};

export const CountryDropdownData = (countryData: any) => {
    if (countryData) {
        if (countryData && countryData?.shop && countryData?.shop?.countries?.length > 0) {
            return countryData?.shop?.countries;
        }
    } else {
        return [];
    }
};

export const billingAddress = {
    firstName: '',
    lastName: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    country: '',
    // email: '',
    phone: '',
    paymentMethod: '',
    transactionId: '',
    countryArea: '',
    pincode: '',
};

export const shippingAddress = {
    firstName: '',
    lastName: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    country: '',
    // email: '',
    phone: '',
    paymentMethod: '',
    transactionId: '',
    countryArea: '',
    pincode: '',
};

export const profilePic = (profile: any) => {
    let profiles;
    if (profile) {
        profiles = profile;
    } else if (profile == undefined) {
        profiles = placeholder;
    } else {
        profiles = placeholder;
    }
    return profiles;
};

export const channels = [
    {
        value: 'INR',
        label: 'INR',
    },
    {
        value: 'USD',
        label: 'USD',
    },
];

export const NotesMsg = [
    { type: 'CONFIRMED', message: 'Order was confirmed' },
    { type: 'FULFILLMENT_FULFILLED_ITEMS', message: 'Order status changed from Processing to Completed' },
    { type: 'ORDER_MARKED_AS_PAID', message: 'Order Payment status changed from Pending to Completed.' },
];

export const objIsEmpty = (obj: object) => {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) return false;
    }
    return true;
};

export const handleExportByChange = (e: any) => {
    const selectedValue = e;

    // Get current date
    const currentDate = new Date();

    // Initialize variables for date range
    let gteDate, lteDate;

    switch (selectedValue) {
        case 'weekly':
            gteDate = new Date(currentDate);
            gteDate.setDate(currentDate.getDate() - 6); // Start of the week
            lteDate = currentDate; // Today
            break;
        case 'monthly':
            gteDate = new Date(currentDate);
            gteDate.setDate(currentDate.getDate() - 29);
            lteDate = currentDate; // Today
            break;
        case '3Months':
            gteDate = new Date(currentDate);
            gteDate.setDate(currentDate.getDate() - 89); // 90 days ago
            lteDate = currentDate; // Today
            break;
        case '6Months':
            gteDate = new Date(currentDate);
            gteDate.setDate(currentDate.getDate() - 179); // 180 days ago
            lteDate = currentDate; // Today
            break;
        case 'year':
            gteDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate()); // 1 year ago
            lteDate = currentDate; // Today
            break;
        default:
            // For default or empty option, set date range to null
            gteDate = null;
            lteDate = null;
    }
    const body = {
        gte: gteDate,
        lte: lteDate,
    };
    return body;
};
export const downloadExlcel = (excelData: any, fileName: any) => {
    const filetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8';
    const fileExtension = '.csv';
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'csv', type: 'array' });
    const data = new Blob([excelBuffer], { type: filetype });
    FileSaver.saveAs(data, fileName + fileExtension);
};

export const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    let month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
    let day = now.getDate().toString().padStart(2, '0');
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const mintDateTime = (date: any) => {
    const now = new Date(date);
    const year = now.getFullYear();
    let month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
    let day = now.getDate().toString().padStart(2, '0');
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};
export const roundOff = (price: any) => {
    let roundedPrice = '';
    if (price) {
        const roundedValue = Math.ceil(price);
        roundedPrice = roundedValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    } else {
        roundedPrice = price;
    }
    return roundedPrice;
};

export const formatCurrency = (currency: any) => {
    if (currency === 'INR') {
        return '₹';
    } else {
        return '$';
    }
};

export const addCommasToNumber = (value: any) => {
    if (typeof value === 'number') {
        return value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    } else {
        return value;
    }
};

export const OrderStatus = (status: any) => {
    if (status === 'FULFILLED') {
        return 'Completed';
    } else if (status == 'UNCONFIRMED') {
        return 'Processing';
    } else if (status == 'UNFULFILLED') {
        return 'UNFULFILLED';
    } else if (status == 'CANCELED') {
        return 'Cancelled';
    }

    //     Processing  == UNCONFIRMED
    // on hold    == UNFULFILLED
    // completed == FULFILLED
    // cancelled == cancelled
};

export const PaymentStatus = (status: any) => {
    if (status === 'NOT_CHARGED') {
        return 'Pending';
    } else {
        return 'Completed';
    }
};

export const getDateRange = (rangeType) => {
    console.log('rangeType: ', rangeType);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    let startDate, endDate;

    if (rangeType === 'thisMonth') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
    } else if (rangeType === 'lastMonth') {
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (rangeType === 'last7Days') {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        endDate = today;
    } else if (rangeType === 'Year') {
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = today;
    } else {
        throw new Error("Invalid rangeType. Use 'thisMonth', 'lastMonth', 'last7Days', or 'lastYear'.");
    }
    console.log('startDate: ', startDate);

    const start = moment(startDate).format('YYYY-MM-DD');
    console.log('start: ', start);
    const end = moment(endDate).format('YYYY-MM-DD');

    return { start, end };
};

export const filterByDates = (filter: any, fromDate: any, toDate: any) => {
    let startDate: any, endDate: any;

    if (filter == 'Last 7 Days') {
        const { start, end } = getDateRange('last7Days');
        (startDate = start), (endDate = end);
    }

    if (filter == 'This Month') {
        const { start, end } = getDateRange('thisMonth');
        (startDate = start), (endDate = end);
    }

    if (filter == 'Last Month') {
        const { start, end } = getDateRange('lastMonth');
        (startDate = start), (endDate = end);
    }
    if (filter == 'Year') {
        const { start, end } = getDateRange('Year');
        (startDate = start), (endDate = end);
    }

    if (filter == 'Custome') {
        (startDate = moment(fromDate).format('YYYY-MM-DD')), (endDate = moment(toDate).format('YYYY-MM-DD'));
    }
    return { startDate, endDate };
};

export const formatOptions = (lists) => {
    return lists?.flatMap((item) => {
        const children =
            item?.node?.children?.edges?.map((child) => ({
                value: child?.node?.id,
                label: `-- ${child?.node?.name}`,
            })) || [];
        return [{ value: item?.node?.id, label: item?.node?.name }, ...children];
    });
};
