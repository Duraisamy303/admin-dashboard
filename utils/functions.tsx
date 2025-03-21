import { useState } from 'react';
import Swal from 'sweetalert2';
import placeholder from '../public/assets/images/placeholder.png';
import * as FileSaver from 'file-saver';
import XLSX from 'sheetjs-style';
import moment from 'moment';
import AWS from 'aws-sdk';
import axios from 'axios';
import Resizer from 'react-image-file-resizer';

export const accessKeyId = 'DO00MUC2HWP9YVLPXKXT';
export const secretAccessKey = 'W9N9b51nxVBvpS59Er9aB6Ht7xx2ZXMrbf3vjBBR8OA';

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
        const token = localStorage.getItem('adminToken');
        const formData = new FormData();

        // Define GraphQL mutation operation
        const operations = {
            operationName: 'ProductMediaCreate',
            variables: { productId: productId, alt: '', media_url: null },
            query: `mutation productMediaCreate($productId: ID!, $media_url: String!, $alt: String!) {
                productMediaCreate(input: { product: $productId, alt: $alt, mediaUrl: $media_url }) {
                    product {
                        id
                        name
                    }
                    media {
                        id
                        url
                        alt
                        oembedData
                    }
                    errors {
                        field
                        message
                    }
                }
            }`,
        };

        formData.append('operations', JSON.stringify(operations));

        // Map the file to variables.media_url
        formData.append('map', JSON.stringify({ '1': ['variables.media_url'] }));
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
        const token = localStorage.getItem('adminToken');
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
    try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        // Ensure the fileName has a valid extension
        const fileExtension = blob.type.split('/')[1];
        const fileName = `uploaded_image.${fileExtension}`;
        const file = new File([blob], fileName, { type: blob.type });
        const token = localStorage.getItem('adminToken');
        const formData = new FormData();

        const operations = JSON.stringify({
            operationName: 'CategoryUpdate',
            variables: {
                id: categoryId,
                input: {
                    backgroundImage: null, // Placeholder for the file variable
                },
            },
            query: `mutation updateCategory($id: ID!, $input: CategoryInput!) {
  categoryUpdate(id: $id, input: $input) {
    category {
      id
      name
      backgroundImageUrl
      description
      slug
      __typename
    }
    __typename
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
        if (shippingProvider && shippingProvider?.length > 0) {
            const dropdownData = shippingProvider?.map((item: any) => ({
                value: item.node?.id,
                label: `${item?.node?.firstName} ${item?.node?.lastName}`,
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
        profiles = "/assets/images/placeholder.png";
    } else {
        profiles = "/assets/images/placeholder.png";
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
    { type: 'ORDER_MARKED_AS_PAID', message: 'Order Payment status changed from Pending to Completed.' },
    { type: 'PAYMENT_REFUNDED', message: 'Order Refund updated.' },
    { type: 'FULFILLMENT_REFUNDED', message: 'Order Refund updated.' },
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

export const PaymentStatus = (status: any, origin: any, totalRefund: any) => {
    if (origin == 'CHECKOUT') {
        if (totalRefund?.amount == 0) {
            if (status === 'NOT_CHARGED') {
                return 'Pending';
            } else if (status === 'FULLY_REFUNDED') {
                return 'Fully Refunded';
            } else if (status === 'PARTIALLY_REFUNDED') {
                return 'Partially Refunded';
            } else {
                return 'Completed';
            }
        } else {
            return 'Partially Refunded';
        }
    } else {
        if (status === 'NOT_CHARGED') {
            return 'Pending';
        } else if (status === 'FULLY_REFUNDED') {
            return 'Fully Refunded';
        } else if (status === 'PARTIALLY_REFUNDED') {
            return 'Partially Refunded';
        } else {
            return 'Completed';
        }
    }
};

// else if (status === 'FULLY_CHARGED') {
//     return 'Partially refunded';
// }

export const getDateRange = (rangeType) => {
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

    const start = moment(startDate).format('YYYY-MM-DD');
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

export const fetchImagesFromS3 = async (searchTerm = '', limit = 10, continuationToken = null) => {
    const spacesEndpoint = new AWS.Endpoint('https://blr1.digitaloceanspaces.com');
    const s3 = new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId, // Add your access key here
        secretAccessKey, // Add your secret key here
    });
    const params = {
        Bucket: 'prade', // Your Space name
        MaxKeys: limit, // Set the number of items to fetch per request (pagination size)
        ContinuationToken: continuationToken,
    };
    try {
        let allObjects = [];
        let isTruncated = true;
        let continuationToken = null;

        while (isTruncated) {
            const data = await s3
                .listObjectsV2({
                    ...params,
                    ContinuationToken: continuationToken,
                })
                .promise();
            allObjects = [...allObjects, ...data.Contents];
            isTruncated = data.IsTruncated;
            continuationToken = data.NextContinuationToken;
        }

        const searchLower = searchTerm.toLowerCase();
        const filteredObjects = allObjects.filter((item) => item.Key.toLowerCase().includes(searchLower));
        const imageUrls = filteredObjects.map((item) => ({
            url: `https://prade.blr1.cdn.digitaloceanspaces.com/${item.Key}`,
            key: item.Key,
            LastModified: item.LastModified,
            ...item,
        }));
        return imageUrls.sort((a: any, b: any) => b.LastModified - a.LastModified);
    } catch (error) {
        console.error('Error fetching images:', error);
    }
};

export const deleteImagesFromS3 = async (key) => {
    const spacesEndpoint = new AWS.Endpoint('https://blr1.digitaloceanspaces.com');
    const s3 = new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId, // Add your access key here
        secretAccessKey, // Add your secret key here
    });
    const params = {
        Bucket: 'prade', // Your Space name
        Key: key,
    };
    try {
        const res = await s3.deleteObject(params).promise();
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

export const generateUniqueFilename = async (existingFiles, filename) => {
    let uniqueFilename = filename;
    let counter = 1;
    let fileExists = true;

    while (fileExists) {
        fileExists = existingFiles.some((item) => getKey(item.node.fileUrl) === uniqueFilename);
        if (fileExists) {
            const fileParts = filename.split('.');
            const extension = fileParts.pop();
            uniqueFilename = `${fileParts.join('.')}-${counter}.${extension}`;
            counter++;
        }
    }
    return uniqueFilename;
};

export const generatePresignedPost = async (file) => {
    const spacesEndpoint = new AWS.Endpoint('https://prade.blr1.digitaloceanspaces.com');

    const s3 = new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId, // Add your access key here
        secretAccessKey, // Add your secret key here
    });

    // const uniqueFilename = await generateUniqueFilename(file.name);

    const params = {
        Bucket: 'prade', // Your Space name
        Fields: {
            key: file.name, // File name
            acl: 'public-read',
        },
        Conditions: [
            ['content-length-range', 0, 104857600], // 100 MB limit
            ['starts-with', '$Content-Type', ''], // Allow any content type
            ['eq', '$key', file.name],
        ],
        Expires: 60, // 1 minute expiration
    };

    return new Promise((resolve, reject) => {
        s3.createPresignedPost(params, (err, data) => {
            if (err) {
                console.log('err: ', err);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

export const generatePresignedVideoPost = async (file) => {
    const spacesEndpoint = new AWS.Endpoint('https://prade.blr1.digitaloceanspaces.com');

    const s3 = new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId, // Add your access key here
        secretAccessKey, // Add your secret key here
    });
    // const uniqueFilename = await generateUniqueFilename(file.name);

    const params = {
        Bucket: 'prade', // Your Space name
        Fields: {
            key: file.name, // File name
            acl: 'public-read',
        },
        Conditions: [
            ['content-length-range', 0, 104857600], // 100 MB limit (adjust as needed)
            ['starts-with', '$Content-Type', ''], // Ensure only MP4 files are allowed
            ['eq', '$key', file.name],
        ],
        Expires: 60, // 1 minute expiration
    };

    return new Promise((resolve, reject) => {
        s3.createPresignedPost(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

export const filterByMonth = (arr, year, month) => {
    return arr?.filter((item) => {
        const date = new Date(item.LastModified);
        return date.getFullYear() === year && date.getMonth() === month - 1; // month is 0-indexed
    });
};

export const separateFiles = (files) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const videoExtensions = ['mp4'];

    const images = files.filter((file) => imageExtensions.includes(file.key.split('.').pop().toLowerCase()));

    const videos = files.filter((file) => videoExtensions.includes(file.key.split('.').pop().toLowerCase()));

    return { images, videos };
};

export const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const dropdown = (arr: any[]) => {
    const array = arr?.map((item) => ({ value: item, label: item }));
    return array;
};

export const formatDateTimeLocal = (dateString) => {
    const date: any = new Date(dateString);
    const tzOffset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localISOTime = new Date(date - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
};

export const matchData = (data, ids) => {
    const result = [];

    Object.keys(ids).forEach((key) => {
        ids[key].forEach((id) => {
            const edges = data[key]?.edges;
            if (edges) {
                const match = edges.find((edge) => edge.node.id === id);
                if (match) {
                    result.push({
                        type: key,
                        id: match.node.id,
                        name: match.node.name,
                    });
                }
            }
        });
    });

    return result;
};

export const USDAmt = 0.013;

export const freeShipping = ['U2hpcHBpbmdNZXRob2Q6MTk=', 'U2hpcHBpbmdNZXRob2Q6MjA='];

export const DateToStringFormat = (inputDate, day = 9, hour = 16, minute = 9, second = 0, millisecond = 0, timezoneOffset = '+05:30') => {
    const date = new Date(inputDate);

    date.setDate(day);
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(second);
    date.setMilliseconds(millisecond);

    const formattedDatetime = date.toISOString().slice(0, 19) + timezoneOffset;
    return formattedDatetime;
};

export const filterImages = (files) => {
    const imageExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp']; // Add other image extensions if needed
    return files.filter((file) => {
        const extension = file.key.split('.').pop().toLowerCase();
        return imageExtensions.includes(extension);
    });
};

export const imageFilter = (res) => {
    const imgFormats = ['.jpeg', '.png', '.jpg', '.webp'];
    const endsWithAny = (url, formats) => formats.some((format) => url?.endsWith(format));
    const filter = res?.filter((mediaItem) => endsWithAny(mediaItem.url, imgFormats));
    return filter;
};

export const videoFilter = (res) => {
    const mp4Formats = ['.mp4', '.webm'];
    const endsWithAny = (url, formats) => formats.some((format) => url?.endsWith(format));
    const filter = res?.filter((mediaItem) => endsWithAny(mediaItem.url, mp4Formats));
    return filter;
};

export const docFilter = (res) => {
    const docFormats = ['.doc', '.pdf'];
    const endsWithAny = (url, formats) => formats.some((format) => url?.endsWith(format));
    const filter = res?.filter((mediaItem) => endsWithAny(mediaItem.url, docFormats));
    return filter;
};

export const exceptDocFilter = (res) => {
    const excludedFormats = ['.doc', '.pdf']; // Formats to exclude

    const endsWithNone = (url, formats) => !formats.some((format) => url?.endsWith(format));
    // Filter out media items that are not in the excluded formats and are in the allowed formats
    const filter = res?.filter((mediaItem) => endsWithNone(mediaItem.url, excludedFormats));

    return filter;
};

export const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const addNewFile = async (e: any) => {
    try {
        let file = e.target.files[0];
        // let uniqueFilename = await generateUniqueFilename(file.name);
        const isImage = file.type.startsWith('image/');
        if (isImage) {
            if (file.size > 300 * 1024) {
                file = await resizingImage(file);
                file = await resizeImage(file, 1160, 1340);
            } else {
                file = await resizeImage(file, 1160, 1340);
            }
            const { width, height } = await getImageDimensions(file);
            console.log('Image width, height: ', width, height);
        }

        file = new File([file], file.name, {
            type: file.type,
            lastModified: file.lastModified,
        });

        let presignedPostData = null;
        if (file?.name?.endsWith('.mp4')) {
            presignedPostData = await generatePresignedVideoPost(file);
        } else {
            presignedPostData = await generatePresignedPost(file);
        }

        const formData = new FormData();
        Object.keys(presignedPostData.fields).forEach((key) => {
            formData.append(key, presignedPostData.fields[key]);
        });
        formData.append('file', file);

        await axios.post(presignedPostData.url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // await fetchImagesFromS3();
        const urls = `https://prade.blr1.digitaloceanspaces.com/${presignedPostData?.fields?.key}`;
        return urls;
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

export const addNewMediaFile = async (file: any, uniqueFilename: any) => {
    try {
        // let uniqueFilename = await generateUniqueFilename(file.name);
        const isImage = file.type.startsWith('image/');
        if (isImage) {
            if (file.size > 300 * 1024) {
                file = await resizingImage(file);
                file = await resizeImage(file, 1160, 1340);
            } else {
                file = await resizeImage(file, 1160, 1340);
            }
            const { width, height } = await getImageDimensions(file);
            console.log('Image width, height: ', width, height);
        }

        file = new File([file], uniqueFilename, {
            type: file.type,
            lastModified: file.lastModified,
        });

        let presignedPostData = null;
        if (file?.name?.endsWith('.mp4')) {
            presignedPostData = await generatePresignedVideoPost(file);
        } else {
            presignedPostData = await generatePresignedPost(file);
        }

        const formData = new FormData();
        Object.keys(presignedPostData.fields).forEach((key) => {
            formData.append(key, presignedPostData.fields[key]);
        });
        formData.append('file', file);

        await axios.post(presignedPostData.url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const urls = `https://prade.blr1.digitaloceanspaces.com/${presignedPostData?.fields?.key}`;
        return urls;
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

export const resizingImage = (file) => {
    return new Promise((resolve, reject) => {
        Resizer.imageFileResizer(
            file,
            1160, // Max width
            1340, // Max height
            'JPEG', // Format
            70, // Quality (adjust to get file size below 300KB)
            0, // Rotation
            (uri: any) => {
                // Convert resized image blob to File
                const resizedFile = new File([uri], file.name, { type: uri.type });
                console.log('resizedFile: ', resizedFile);
                resolve(resizedFile);
            },
            'blob' // Output type
        );
    });
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        const reader = new FileReader();

        reader.onload = (e) => {
            if (e.target?.result) {
                img.src = e.target.result as string;
            } else {
                reject(new Error('Failed to read file'));
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };

        img.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
};

export const resizeImage = (file: File, width: number, height: number): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            canvas.width = width;
            canvas.height = height;
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(new File([blob], file.name, { type: file.type }));
                    } else {
                        reject(new Error('Failed to resize image'));
                    }
                }, file.type);
            } else {
                reject(new Error('Failed to get canvas context'));
            }
        };

        img.onerror = (error) => {
            reject(error);
        };

        img.src = URL.createObjectURL(file);
    });
};

export const validateDateTime = (dateTimeString) => {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    if (!regex.test(dateTimeString)) {
        return false;
    }

    const date = new Date(dateTimeString);
    return !isNaN(date.getTime());
};

// export const getFileType = async (url) => {
//     const extensionToMime = {
//         jpg: 'image/jpg',
//         jpeg: 'image/jpeg',
//         png: 'image/png',
//         gif: 'image/gif',
//         webp: 'image/webp',
//         pdf: 'application/pdf',
//         doc: 'application/msword',
//         mp3: 'audio/mpeg',
//         wav: 'audio/wav',
//         mp4: 'audio/mp4',
//     };

//     try {
//         const response = await fetch(url, { method: 'HEAD' });
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         let contentType = response.headers.get('Content-Type');
//         if (contentType === 'binary/octet-stream') {
//             const extension = url.split('.').pop().toLowerCase();
//             contentType = extensionToMime[extension] || 'application/octet-stream';
//         }
//         return contentType;
//     } catch (error) {
//         console.error('There has been a problem with your fetch operation:', error);
//         return null;
//     }
// };

export const getFileType = async (filename) => {
    const videoFormats = new Set(['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'mpeg', 'ogv']);
    const imageFormats = new Set(['jpeg', 'jpg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'heic', 'ico']);
    const documentFormats = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']);

    const getFileExtension = (filename) => {
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    };

    const ext = getFileExtension(filename);

    if (videoFormats.has(ext)) {
        return 'Video';
    } else if (imageFormats.has(ext)) {
        return 'Image';
    } else if (documentFormats.has(ext)) {
        return 'Doc';
    } else {
        return 'unknown';
    }
};

export const getFileNameFromUrl = (url) => {
    const urlObject = new URL(url);
    const pathname = urlObject.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    return filename;
};
export const isValidImageUrl = (url) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some((ext) => url?.toLowerCase().endsWith(ext));
};

export const getUniqueStates = (states: any) => {
    const uniqueStates = [];
    const seen = new Set();
    states.forEach((state) => {
        if (!seen.has(state.raw)) {
            uniqueStates.push(state);
            seen.add(state.raw);
        }
    });

    return uniqueStates;
};

export const uniqueStateAddress = (data) => {
    const uniqueData = data?.reduce((acc, current) => {
        const duplicate = acc?.find((item) => item?.raw === current?.raw);
        if (!duplicate) {
            acc.push(current);
        }
        return acc;
    }, []);
    return uniqueData;
};

export const generateLineChartLoopData = (data: any[]) => {
    // Extract value keys
    const valueKeys = Object.keys(data[0]).filter((key) => key.startsWith('value'));

    return valueKeys.map((key, index) => ({
        name: `Value ${index + 1}`,
        type: 'line',
        data: data.map((item) => item[key]),
    }));
};

export const generateColors = (numColors: number): string[] => {
    const colors = [];
    const hueStep = 360 / numColors;

    for (let i = 0; i < numColors; i++) {
        const hue = Math.round(i * hueStep);
        colors.push(`hsl(${hue}, 100%, 50%)`);
    }

    return colors;
};

export const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            options.push(timeString);
        }
    }
    options.push('24:00'); // Add the final option
    return dropdown(options);
};

export const formatTime = (time) => {
    const formattedTime = `${time.slice(0, 5)}`;
    const dropdownFormat = { value: formattedTime, label: formattedTime };
    return dropdownFormat;
};

export const isValidUrl = (url) => {
    const regex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;
    return regex.test(url);
};

export const fetchImagesFromS3WithPagination = async (searchTerm = '', limit = 10, continuationToken = null) => {
    console.log('continuationToken: ', continuationToken);
    console.log('limit: ', limit);
    console.log('searchTerm: ', searchTerm);
    const spacesEndpoint = new AWS.Endpoint('https://blr1.digitaloceanspaces.com');
    const s3 = new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId, // Add your access key here
        secretAccessKey, // Add your secret key here
    });

    const params = {
        Bucket: 'prade', // Your Space name
        MaxKeys: limit, // Set the number of items to fetch per request (pagination size)
        ContinuationToken: continuationToken, // Token to fetch the next set of results
    };

    try {
        const data = await s3.listObjectsV2(params).promise();

        // Filter results based on search term
        const searchLower = searchTerm.toLowerCase();
        const filteredObjects = data.Contents.filter((item) => item.Key.toLowerCase().includes(searchLower));

        // Map the filtered objects to return necessary information
        const imageUrls = filteredObjects.map((item) => ({
            url: `https://prade.blr1.cdn.digitaloceanspaces.com/${item.Key}`,
            key: item.Key,
            LastModified: item.LastModified,
            ...item,
        }));

        // Sort the results by LastModified date
        const sortedImages = imageUrls.sort((a: any, b: any) => b.LastModified - a.LastModified);

        return {
            images: sortedImages,
            isTruncated: data.IsTruncated, // If there are more items to fetch
            continuationToken: data.NextContinuationToken || null, // Token for the next page
        };
    } catch (error) {
        console.error('Error fetching images:', error);
        throw error;
    }
};

export const getImageSizeInKB = async (imageUrl) => {
    try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        const contentLength: any = response.headers.get('Content-Length');

        if (contentLength) {
            const sizeInKB = contentLength / 1024; // Convert bytes to KB
            return sizeInKB.toFixed(2); // Return size as a string with 2 decimal points
        } else {
            console.log('Unable to retrieve content length.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching the image:', error);
        return null;
    }
};

export const getMonthNumber = (dateString) => {
    const date = new Date(dateString);

    const monthNumber = date.getMonth() + 1;
    return monthNumber;
};

export const getKey = (imageUrl) => {
    const key = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
    return key;
};

export const uniqueState = (arr) => {
    const uniqueChoices = arr?.reduce((acc, current) => {
        if (!acc.some((item) => item?.raw === current?.raw)) {
            acc.push(current);
        }
        return acc;
    }, []);
    return uniqueChoices;
};

export const addReportCommasToNumber = (value: any) => {
    if (typeof value === 'number') {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0,
        }).format(value);
    } else {
        return value;
    }
};

export const Quantity = (orderData, grantedRefunds) => {
    const fulfillmentLines = orderData?.lines || [];
    const refundedLines = grantedRefunds?.flatMap((refund) => refund.lines) || [];
    const remainingQuantities = {};

    // Create a map to track total refunded quantities for each line ID
    const refundedMap = {};

    // Sum the quantities of the refunded lines grouped by order line ID
    refundedLines.forEach((refundLine) => {
        const orderLineId = refundLine.orderLine.id;
        const quantity = refundLine.quantity;

        // Only add to the map if the order line ID matches a fulfillment line ID
        refundedMap[orderLineId] = (refundedMap[orderLineId] || 0) + quantity;
    });

    // Calculate remaining quantities for each fulfillment line
    fulfillmentLines.forEach((fulfillmentLine) => {
        const orderLineId = fulfillmentLine.id; // Use fulfillment line ID
        const fulfilledQuantity = fulfillmentLine.quantity || 0; // Default to 0 if undefined
        const refundedQuantity = refundedMap[orderLineId] || 0; // Get the total refunded quantity for this ID

        // Calculate remaining quantity
        remainingQuantities[orderLineId] = fulfilledQuantity - refundedQuantity;
    });

    return remainingQuantities;
};

export const FullfillQuantity = (orderData, grantedRefunds) => {
    const fulfillmentLines = orderData?.lines || [];
    const refundedLines = grantedRefunds?.flatMap((refund) => refund.lines) || [];
    const remainingQuantities = {};

    // Create a map to track total refunded quantities for each line ID
    const refundedMap = {};

    // Sum the quantities of the refunded lines grouped by order line ID
    refundedLines.forEach((refundLine) => {
        const lineId = refundLine.orderLine.id;
        const quantity = refundLine.quantity;

        // Only add to the map if the order line ID matches a fulfillment line ID
        refundedMap[lineId] = (refundedMap[lineId] || 0) + quantity;
    });

    // Calculate remaining quantities for each fulfillment line
    fulfillmentLines.forEach((fulfillmentLine) => {
        const orderLineId = fulfillmentLine?.orderLine?.id; // Use orderLine ID
        const fulfilledQuantity = fulfillmentLine?.quantity || 0; // Default to 0 if undefined
        const refundedQuantity = refundedMap[orderLineId] || 0; // Get the total refunded quantity for this ID

        // Calculate remaining quantity
        remainingQuantities[orderLineId] = fulfilledQuantity - refundedQuantity;
    });

    // Handle cases where there are no refunded lines
    if (refundedLines.length === 0) {
        fulfillmentLines.forEach((fulfillmentLine) => {
            const orderLineId = fulfillmentLine?.orderLine?.id;
            const fulfilledQuantity = fulfillmentLine?.quantity || 0;
            remainingQuantities[orderLineId] = fulfilledQuantity;
        });
    }

    return remainingQuantities;
};

export const DraftQuantity = (orderData, grantedRefunds) => {
    const fulfillmentLines = orderData?.lines || [];
    const refundedLines = grantedRefunds?.flatMap((refund) => refund.lines) || [];
    const remainingQuantities = {};

    // Create a map to track total refunded quantities for each line ID
    const refundedMap = {};

    // Sum the quantities of the refunded lines grouped by order line ID
    refundedLines.forEach((refundLine) => {
        const orderLineId = refundLine.orderLine.id;
        const quantity = refundLine.quantity;

        // Only add to the map if the order line ID matches a fulfillment line ID
        refundedMap[orderLineId] = (refundedMap[orderLineId] || 0) + quantity;
    });

    // Calculate remaining quantities for each fulfillment line
    fulfillmentLines.forEach((fulfillmentLine) => {
        const orderLineId = fulfillmentLine.id; // Use fulfillment line ID
        const fulfilledQuantity = fulfillmentLine.quantity || 0; // Default to 0 if undefined
        const refundedQuantity = refundedMap[orderLineId] || 0; // Get the total refunded quantity for this ID

        // Calculate remaining quantity
        remainingQuantities[orderLineId] = fulfilledQuantity - refundedQuantity;
    });

    return remainingQuantities;
};

export const DraftFullfillQuantity = (orderData, grantedRefunds) => {
    const fulfillmentLines = orderData?.lines || [];
    console.log('fulfillmentLines: ', fulfillmentLines);
    const refundedLines = grantedRefunds?.lines || [];
    const remainingQuantities = {};

    // Create a map to track total refunded quantities for each line ID
    const refundedMap = {};

    // Sum the quantities of the refunded lines grouped by order line ID
    refundedLines?.forEach((refundLine) => {
        const lineId = refundLine.id;
        const quantity = refundLine.quantity;

        // Only add to the map if the order line ID matches a fulfillment line ID
        refundedMap[lineId] = (refundedMap[lineId] || 0) + quantity;
    });

    // Calculate remaining quantities for each fulfillment line
    fulfillmentLines?.forEach((fulfillmentLine) => {
        console.log('fulfillmentLine: ', fulfillmentLine);
        const orderLineId = fulfillmentLine?.id; // Use orderLine ID
        const fulfilledQuantity = fulfillmentLine?.quantity || 0; // Default to 0 if undefined
        const refundedQuantity = refundedMap[orderLineId] || 0; // Get the total refunded quantity for this ID

        // Calculate remaining quantity
        remainingQuantities[orderLineId] = fulfilledQuantity - refundedQuantity;
    });

    // Handle cases where there are no refunded lines
    if (refundedLines.length === 0) {
        fulfillmentLines.forEach((fulfillmentLine) => {
            const orderLineId = fulfillmentLine?.id;
            const fulfilledQuantity = fulfillmentLine?.quantity || 0;
            remainingQuantities[orderLineId] = fulfilledQuantity;
        });
    }

    return remainingQuantities;
};

export const updateOrderLinesWithRefund = (data) => {
    console.log('data: ', data);
    const order = data.data.order;
    console.log('order: ', order);

    // Filter fulfillments with status "REFUNDED"
    const refundedFulfillments = order?.fulfillments?.filter((f) => f?.status === 'REFUNDED');
    console.log('refundedFulfillments: ', refundedFulfillments);

    // Loop through order lines and update their quantity based on refunded fulfillment lines
    order?.lines?.forEach((line) => {
        refundedFulfillments.forEach((fulfillment) => {
            console.log('fulfillment: ', fulfillment);
            fulfillment.lines.forEach((fulfillmentLine) => {
                console.log('fulfillmentLine: ', fulfillmentLine);
                if (line.id === fulfillmentLine?.orderLine?.id) {
                    // Update the line's quantity by subtracting the refunded quantity
                    line.quantity -= fulfillmentLine?.quantity;
                }
            });
        });
    });

    return order.lines;
};

export const formatKeysArray = (arr) => {
    return arr?.map((obj) => {
        const formattedObj = {};
        Object.keys(obj).forEach((key) => {
            let formattedKey;

            // Check for specific key replacements
            if (key === 'noOfOrders') {
                formattedKey = 'Number Of Orders';
            } else if (key === 'giftwrapAmountList') {
                formattedKey = 'Gift Wrap Amount';
            } else if (key === 'codAmountList') {
                formattedKey = 'COD Amount';
            } else if (key === 'Dates') {
                formattedKey = 'Date';
            } else {
                // Remove unwanted characters like '--' or non-alphanumeric characters
                formattedKey = key
                    .replace(/--/g, '') // Remove double dashes
                    .replace(/_/g, ' ') // Replace underscores with spaces
                    .replace(/[^a-zA-Z0-9 ]/g, '') // Remove any other non-alphanumeric characters
                    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                    .replace(/\s+/g, ' ') // Remove extra spaces
                    .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
            }

            // Add the formatted key to the new object
            formattedObj[formattedKey] = obj[key];
        });
        return formattedObj;
    });
};
