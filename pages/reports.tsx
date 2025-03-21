import React, { Fragment, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Tab } from '@headlessui/react';
import Link from 'next/link';
import {
    Failure,
    addReportCommasToNumber,
    downloadExlcel,
    filterByDates,
    formatCurrency,
    formatKeysArray,
    formatOptions,
    generateColors,
    generateLineChartLoopData,
    getCurrentDateTime,
    getDateRange,
    mintDateTime,
    useSetState,
} from '@/utils/functions';
import IconDownload from '@/components/Icon/IconDownload';
import Tippy from '@tippyjs/react';
import IconPencil from '@/components/Icon/IconPencil';
import { DataTable } from 'mantine-datatable';
import { useMutation, useQuery } from '@apollo/client';
import {
    ANALYSIS_BY_CUSTOMER,
    ANALYSIS_BY_ORDER,
    ANALYSIS_BY_PRODUCT_REVENUE,
    ANALYSIS_BY_REVENUE,
    ANALYSIS_PRODUCT_BY_COUNTRY,
    COUNTRY_LIST,
    CUSTOMER_REPORT_LIST,
    GUEST_LIST,
    NEW_PARENT_CATEGORY_LIST,
    PARENT_CATEGORY_LIST,
    PRODUCT_BY_COUNTRY,
    PRODUCT_BY_NAME,
    SALES_BY_CATEGORY,
    SALES_BY_COUPON,
    SALES_BY_DATE,
    SALES_BY_PRODUCT,
    SALES_BY_SINGLE_PRODUCT,
    UPDATED_PRODUCT_PAGINATION,
} from '@/query/product';
import Select from 'react-select';
import moment from 'moment';
import CommonLoader from './elements/commonLoader';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import CategorySelect from '@/components/CategorySelect';
import ProductSelect from '@/components/ProductSelect';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
});

const tabClassNames = (selected: boolean) =>
    `${selected ? ' text-lg !border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''}
    -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black text-lg `;

const Reports = () => {
    const order = ['Sales by date', 'Sales by product', 'Sales by category', 'Coupons by date'];
    const analysis = ['Order Analysis', 'Revenue Analysis', 'Customer Analysis', 'Product by Country', 'Product Revenue'];
    const customer = ['Guests list', 'Customer list'];
    const orderFilter = ['Last 7 Days', 'This Month', 'Last Month', 'Year', 'Custom'];

    const [salesBydate, { loading: salesBydateLoading }] = useMutation(SALES_BY_DATE);
    const [salesByProduct, { loading: salesByProductLoading }] = useMutation(SALES_BY_PRODUCT);
    const [salesBySingleProduct, { loading: salesBySingleProductLoading }] = useMutation(SALES_BY_SINGLE_PRODUCT);
    const [salesByCategory, { loading: salesByCategoryLoading }] = useMutation(SALES_BY_CATEGORY);
    const [salesByCoupon, { loading: salesByCouponLoading }] = useMutation(SALES_BY_COUPON);
    const [analysisByOrder] = useMutation(ANALYSIS_BY_ORDER);
    const [analysisByRevenue] = useMutation(ANALYSIS_BY_REVENUE);
    const [analysisByCustomer] = useMutation(ANALYSIS_BY_CUSTOMER);
    const [productByCountry] = useMutation(PRODUCT_BY_COUNTRY);
    const [analysisByProductRevenue] = useMutation(ANALYSIS_BY_PRODUCT_REVENUE);
    const [analysisProductByCountry] = useMutation(ANALYSIS_PRODUCT_BY_COUNTRY);
    const [customerList, { loading: customerListLoading }] = useMutation(CUSTOMER_REPORT_LIST);
    const [guestList, { loading: guestListLoading }] = useMutation(GUEST_LIST);

    const { data: productSearch, refetch: productSearchRefetch } = useQuery(PRODUCT_BY_NAME);

    const { data: country } = useQuery(COUNTRY_LIST);

    const { data: parentList, error: parentListError, refetch: parentListRefetch } = useQuery(PARENT_CATEGORY_LIST);

    const { data, refetch: productListSearchRefetch, loading: productLoading } = useQuery(UPDATED_PRODUCT_PAGINATION);

    const { refetch: categoryRefetch } = useQuery(NEW_PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });

    const fetchCategories = async (variables) => {
        return await categoryRefetch(variables);
    };

    const fetchProducts = async (variables) => {
        return await productListSearchRefetch(variables);
    };

    const [state, setState] = useSetState({
        orderSubMenu: 'Sales by date',
        activeTab: 'Orders',
        dateFilter: 'Last 7 Days',
        orderDateFilter: 'Last 7 Days',
        productSearch: '',
        activeAccordion: null,
        analysisTab: 'Order Analysis',
        orderStartDate: new Date(),
        orderEndDate: new Date(),
        orderCurrency: 'All Currencies',
        analysisCurrency: 'All Currencies',
        tableData: [],
        salesByDate: [],
        productList: [],
        tableColumn: [],
        topSellers: [],
        selectedTopSeller: '',
        analysisColumn: [],
        analysisTable: [],
        analysisDateFilter: 'Last 7 Days',
        analysisStartDate: new Date(),
        analysisEndDate: new Date(),
        analysisProductsearch: '',
        analysisSelectedCountries: [],
        analysisSelectedCategory: [],
        analysisSelectedProduct: [],
        countryList: [],
        analysisProductList: [],
        customerDateFilter: 'Last 7 Days',
        customerTab: 'Guests list',
        customerStartDate: new Date(),
        customerEndDate: new Date(),
        customerTable: [],
        customerColumn: [],
        orderChartData: {},
        customerChartData: {},
        analysisChartData: {},
    });

    const getBorderColor = (index) => {
        // const colors = ['#7ad03a', '#a00', '#ffba00', '#2ea2cc', '#a46497', '#ebe9eb', '#515151', '#77a464', '#767676'];
        const colors = ['#2ea2cc'];

        return colors[index % colors.length];
    };

    const toggleAccordion = (accordion) => {
        setState({
            activeAccordion: state.activeAccordion === accordion ? null : accordion,
        });
    };

    useEffect(() => {
        if (state.orderSubMenu == 'Sales by product') {
            getSalesByProduct();
        }
    }, [state.orderSubMenu]);

    useEffect(() => {
        getCountryList();
    }, [country]);

    useEffect(() => {
        getProductByName();
    }, [productSearch]);

    useEffect(() => {
        if (state.orderSubMenu == 'Sales by date') {
            getSalesByDate();
        } else if (state.orderSubMenu == 'Sales by product') {
            if (state.productSearch !== '') {
                getSalesBySingleProduct('search', state.productSearch?.value);
            }
            if (state.selectedTopSeller !== '') {
                getSalesBySingleProduct('select', state.selectedTopSeller);
            }
        } else if (state.orderSubMenu == 'Sales by category') {
            getSalesByCategory(state.selectedCategory);
        } else if (state.orderSubMenu == 'Coupons by date') {
            getSalesByCoupon();
        }
    }, [state.orderDateFilter, state.orderStartDate, state.orderEndDate, state.orderSubMenu, state.orderCurrency, state.selectedCategory]);

    useEffect(() => {
        if (state.analysisTab == 'Order Analysis') {
            getAnalysisByOrder();
        } else if (state.analysisTab == 'Revenue Analysis') {
            getAnalysisByRevenue();
        } else if (state.analysisTab == 'Customer Analysis') {
            getAnalysisByCustomer();
        } else if (state.analysisTab == 'Product Revenue') {
            getAnalysisByProductRevenue();
        } else if (state.analysisTab == 'Product by Country') {
            getAnalysisProductByCountry();
        }
    }, [
        state.analysisDateFilter,
        state.analysisTab,
        state.analysisStartDate,
        state.analysisEndDate,
        state.analysisCurrency,
        state.analysisSelectedCountries,
        state.analysisSelectedCategory,
        state.analysisSelectedProduct,

        // state.activeTab,
    ]);

    useEffect(() => {
        if (state.customerTab == 'Guests list') {
            getGuestList();
        } else if (state.customerTab == 'Customer list') {
            getCustomerList();
        }
    }, [state.customerDateFilter, state.customerTab, state.customerStartDate, state.customerEndDate]);

    useEffect(() => {
        GetcategoryFilterData();
    }, [parentList]);

    const GetcategoryFilterData = async () => {
        try {
            const res: any = await parentListRefetch();

            const getparentCategoryList = res?.data?.categories?.edges;
            const options = formatOptions(getparentCategoryList);
            setState({ categoryList: options });
            // setParentLists(getparentCategoryList);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getCountryList = async () => {
        try {
            const dropdownData = country?.shop?.countries?.map((item: any) => {
                return { value: item.code, label: item.country };
            });

            setState({ countryList: dropdownData });
            // setParentLists(getparentCategoryList);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getProductByName = async () => {
        try {
            const res = await productSearchRefetch({
                name: '',
            });

            const response = res?.data?.products?.edges;
            const dropdownData = response?.map((item: any) => ({ value: item?.node?.id, label: item?.node?.name }));
            setState({ analysisProductList: dropdownData });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getSalesByDate = async () => {
        try {
            let startDate: any, endDate: any;

            if (state.orderDateFilter == 'Last 7 Days') {
                const { start, end } = getDateRange('last7Days');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'This Month') {
                const { start, end } = getDateRange('thisMonth');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'Last Month') {
                const { start, end } = getDateRange('lastMonth');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'Year') {
                const { start, end } = getDateRange('Year');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'Custom') {
                (startDate = moment(state.orderStartDate).format('YYYY-MM-DD')), (endDate = moment(state.orderEndDate).format('YYYY-MM-DD'));
            }

            const variables = {
                fromdate: startDate,
                toDate: endDate,
                currency: state.orderCurrency,
            };

            const res = await salesBydate({
                variables,
            });
            const response = res?.data?.salesByDate;

            const salesByDate = [
                {
                    name: 'Orders Placed',
                    value: response.noOfOrderListCount,
                },

                {
                    name: 'Total Items Sold',
                    value: response.totalItemsSoldListCount,
                },
                {
                    name: 'Products Total Amount',
                    value: `${formatCurrency('INR')}${addReportCommasToNumber(response.productsTotalAmountTotal)}`,
                },
                {
                    name: `Refunded`,
                    value: `${formatCurrency('INR')}${addReportCommasToNumber(response.refundAmountListTotal)}`,
                },
                {
                    name: 'Charged For Shipping',
                    value: `${formatCurrency('INR')}${addReportCommasToNumber(response.shippingAmountListTotal)}`,
                },
                {
                    name: 'Worth Of Coupons Used',
                    value: `${formatCurrency('INR')}${addReportCommasToNumber(response.couponAmountListTotal)}`,
                },
                {
                    name: 'COD Amount',
                    value: `${formatCurrency('INR')}${addReportCommasToNumber(response.codAmountListTotal)}`,
                },
                {
                    name: 'Gift Wrap Amount',
                    value: `${formatCurrency('INR')}${addReportCommasToNumber(response.giftwrapAmountListTotal)}`,
                },
            ];

            const tableColumn = [
                { accessor: 'date', title: 'Date' },
                { accessor: 'noOfOrders', title: 'Number Of Orders' },
                { accessor: 'totalItemsSold', title: 'Total Items Sold' },
                { accessor: 'couponAmount', title: 'Coupon Amount' },
                { accessor: 'refundAmount', title: 'Refund Amount' },
                { accessor: 'shippingAmount', title: 'Shipping Amount' },
                { accessor: 'productsTotalAmount', title: 'Products Total Amount' },
                { accessor: 'codAmountList', title: 'COD Amount' },
                { accessor: 'giftwrapAmountList', title: 'Gift Wrap Amount' },
            ];
            const tableData = salesBydateTable(response);
            const orderChartData = {
                series: [
                    { name: 'Total Items Sold', type: 'line', data: tableData.map((item) => item?.totalItemsSold) },
                    { name: 'Shipping Amount', type: 'line', data: tableData.map((item) => item?.shippingAmount) },
                    { name: 'Refund Amount', type: 'line', data: tableData.map((item) => item?.refundAmount) },
                    { name: 'Number Of Orders', type: 'line', data: tableData.map((item) => item?.noOfOrders) },
                    { name: 'Coupon Amount', type: 'line', data: tableData.map((item) => item?.couponAmount) },
                    { name: 'Products Total Amount', type: 'line', data: tableData.map((item) => item?.productsTotalAmount) },
                    { name: 'COD Amount ', type: 'line', data: tableData.map((item) => item?.codAmountList) },
                    { name: 'Gift Wrap Amount ', type: 'line', data: tableData.map((item) => item?.giftwrapAmountList) },
                ],
                options: {
                    chart: {
                        height: 350,
                        type: 'line',
                        zoom: { enabled: false }, // Disable zoom
                        toolbar: { show: false }, // Disable chart toggle and toolbar
                    },
                    colors: ['#FF0000', '#0000FF', '#FF00FF', '#00FFFF', '#FFFF00', '#FF8000', '#00FF00', '#8000FF'],
                    stroke: { width: [2, 2, 2, 2, 2, 2, 2, 2] },
                    markers: {
                        size: 5,
                        colors: ['white'],
                        strokeColors: '#000000',
                        strokeWidth: 2,
                        hover: { size: 7 },
                    },
                    dataLabels: { enabled: false },
                    xaxis: {
                        categories: tableData.map((item) => item.date),
                        tickPlacement: 'on',
                        title: { text: 'Date' },
                        labels: { rotate: -45, trim: true },
                    },
                    yaxis: {
                        title: { text: 'Values' },
                        min: 0,
                    },
                    tooltip: { shared: true },
                },
            };
            setState({ orderChartData, tableData, salesByDate, tableColumn });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getSalesByProduct = async () => {
        try {
            let startDate: any, endDate: any;

            if (state.orderDateFilter == 'Last 7 Days') {
                const { start, end } = getDateRange('last7Days');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'This Month') {
                const { start, end } = getDateRange('thisMonth');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'Last Month') {
                const { start, end } = getDateRange('lastMonth');
                (startDate = start), (endDate = end);
            }
            if (state.orderDateFilter == 'Year') {
                const { start, end } = getDateRange('Year');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'Custom') {
                (startDate = moment(state.orderStartDate).format('YYYY-MM-DD')), (endDate = moment(state.orderEndDate).format('YYYY-MM-DD'));
            }

            const res = await salesByProduct({
                variables: {
                    fromdate: startDate,
                    toDate: endDate,
                    currency: state.orderCurrency,
                },
            });
            const structuredData = res?.data?.salesByProduct?.topProducts?.map(cleanAndParseJSON);

            const dropdownData = structuredData?.map((item: any) => {
                return { value: item.variant__product__id, label: item.variant__product__name };
            });
            setState({ tableData: [], productList: dropdownData, tableColumn: [], topSellers: structuredData });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getSalesBySingleProduct = async (type: string, productId: any) => {
        try {
            if (type == 'search' && state.productSearch == '') {
                Failure('Please select product ');
            } else if (productId == '') {
                const orderChartData = {
                    series: [
                        { name: 'Total Items Sold', type: 'line', data: [] },
                        { name: 'Product Total Amount', type: 'line', data: [] },
                    ],
                    options: {
                        chart: {
                            height: 350,
                            type: 'line',
                            zoom: { enabled: false }, // Disable zoom
                            toolbar: { show: false }, // Disable menu icons (toolbar)
                        },
                        colors: ['#FF0000', '#0000FF'],
                        stroke: { width: [2, 2] },
                        markers: {
                            size: 5,
                            colors: ['white'],
                            strokeColors: '#000000',
                            strokeWidth: 2,
                            hover: { size: 7 },
                        },
                        dataLabels: { enabled: false },
                        xaxis: {
                            categories: [],
                            tickPlacement: 'on',
                            title: { text: 'Date' },
                            labels: { rotate: -45, trim: true },
                        },
                        yaxis: {
                            title: { text: 'Amount' },
                            min: 0,
                        },
                        tooltip: { shared: true },
                    },
                };

                setState({ orderChartData, tableData: [], tableColumn: [] });
            } else {
                let startDate: any, endDate: any;

                if (state.orderDateFilter == 'Last 7 Days') {
                    const { start, end } = getDateRange('last7Days');
                    (startDate = start), (endDate = end);
                }

                if (state.orderDateFilter == 'This Month') {
                    const { start, end } = getDateRange('thisMonth');
                    (startDate = start), (endDate = end);
                }

                if (state.orderDateFilter == 'Last Month') {
                    const { start, end } = getDateRange('lastMonth');
                    (startDate = start), (endDate = end);
                }
                if (state.orderDateFilter == 'Year') {
                    const { start, end } = getDateRange('Year');
                    (startDate = start), (endDate = end);
                }

                if (state.orderDateFilter == 'Custom') {
                    (startDate = moment(state.orderStartDate).format('YYYY-MM-DD')), (endDate = moment(state.orderEndDate).format('YYYY-MM-DD'));
                }

                const res = await salesBySingleProduct({
                    variables: {
                        fromdate: startDate,
                        toDate: endDate,
                        currency: state.orderCurrency,
                        productid: productId,
                    },
                });
                const tableColumn = [
                    // { accessor: 'variant__product__id', title: 'Variant Product ID' },
                    { accessor: 'dates', title: 'Date' },
                    { accessor: 'totalItemsSoldList', title: 'Total Items Sold' },
                    { accessor: 'productsTotalAmount', title: 'Product Total Amount' },
                ];

                const response = res?.data?.salesByProduct;

                const table = response?.dates?.map((dates, index) => ({
                    dates,
                    productsTotalAmount: response?.productsTotalAmount[index],
                    totalItemsSoldList: response?.totalItemsSoldList[index],
                }));

                const orderChartData = {
                    series: [
                        { name: 'Total Items Sold', type: 'line', data: table.map((item) => item?.totalItemsSoldList) },
                        { name: 'Product Total Amount', type: 'line', data: table.map((item) => item?.productsTotalAmount) },
                    ],
                    options: {
                        chart: {
                            height: 350,
                            type: 'line',
                            zoom: { enabled: false }, // Disable zoom
                            toolbar: { show: false },
                        },
                        colors: ['#FF0000', '#0000FF'],
                        stroke: { width: [2, 2, 2, 2, 2, 2, 2, 2] },
                        markers: {
                            size: 5,
                            colors: ['white'],
                            strokeColors: '#000000',
                            strokeWidth: 2,
                            hover: { size: 7 },
                        },
                        // title: { text: 'Metrics Over Time' },
                        dataLabels: { enabled: false },
                        xaxis: {
                            categories: table.map((item) => item.dates),
                            tickPlacement: 'on',
                            title: { text: 'Date' },
                            labels: { rotate: -45, trim: true },
                        },
                        yaxis: {
                            title: { text: 'Values' },
                            min: 0,
                        },
                        tooltip: { shared: false },
                    },
                };

                setState({ orderChartData, tableData: table, tableColumn });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getSalesByCategory = async (categoryid) => {
        try {
            if (categoryid?.length > 0) {
                let startDate, endDate;

                if (state.orderDateFilter == 'Last 7 Days') {
                    const { start, end } = getDateRange('last7Days');
                    startDate = start;
                    endDate = end;
                }

                if (state.orderDateFilter == 'This Month') {
                    const { start, end } = getDateRange('thisMonth');
                    startDate = start;
                    endDate = end;
                }

                if (state.orderDateFilter == 'Last Month') {
                    const { start, end } = getDateRange('lastMonth');
                    startDate = start;
                    endDate = end;
                }

                if (state.orderDateFilter == 'Year') {
                    const { start, end } = getDateRange('Year');
                    startDate = start;
                    endDate = end;
                }

                if (state.orderDateFilter == 'Custom') {
                    startDate = moment(state.orderStartDate).format('YYYY-MM-DD');
                    endDate = moment(state.orderEndDate).format('YYYY-MM-DD');
                }

                const arr = categoryid?.map((item) => item.value);

                const res = await salesByCategory({
                    variables: {
                        fromdate: startDate,
                        toDate: endDate,
                        currency: state.orderCurrency,
                        categoryid: arr,
                    },
                });

                const response = res?.data?.salesByCategory;
                console.log('response: ', response);

                const transformDataForTable = (response, categoryid) => {
                    return response.dates.map((date, index) => {
                        const rowData = { date };
                        response.outputData.forEach((data, dataIndex) => {
                            const key = categoryid[dataIndex]?.label; // Use category label as key
                            rowData[key] = data[index]; // Assign data to the dynamic key
                        });
                        return rowData;
                    });
                };

                const generateColumns = (outputDataLength, categoryid) => {
                    const columns = [{ accessor: 'date', title: 'Date' }];
                    for (let i = 0; i < outputDataLength; i++) {
                        const title = categoryid[i]?.label;
                        columns.push({ accessor: title, title });
                    }
                    return columns;
                };

                const columns = generateColumns(response.outputData.length, categoryid);
                console.log('columns: ', columns);
                const tableData = transformDataForTable(response, categoryid);
                console.log('tableData: ', tableData);

                // Reconstruct series data for the chart
                const series = categoryid.map((category, index) => {
                    return {
                        name: category.label,
                        data: tableData.map((item) => item[category.label]) || [],
                    };
                });
                console.log('series: ', series);

                const orderChartData = {
                    series: series, // Array of series for each category
                    options: {
                        chart: {
                            height: 300,
                            type: 'bar',
                            zoom: {
                                enabled: false,
                            },
                            toolbar: {
                                show: false,
                            },
                        },
                        colors: generateColors(series.length),
                        markers: {
                            size: 5,
                            colors: ['white'],
                            strokeColors: '#000000',
                            strokeWidth: 2,
                            hover: { size: 7 },
                        },
                        dataLabels: {
                            enabled: false,
                        },
                        stroke: {
                            show: true,
                            width: 1,
                        },
                        xaxis: {
                            categories: tableData.map((item) => item.date), // Dates as X-axis categories
                            axisBorder: {
                                color: '#e0e6ed',
                            },
                        },
                        yaxis: {
                            opposite: false,
                            reversed: false,
                        },
                        grid: {
                            borderColor: '#e0e6ed',
                        },
                        plotOptions: {
                            bar: {
                                horizontal: false,
                            },
                        },
                        fill: {
                            opacity: 0.8,
                        },
                    },
                };

                setState({ orderChartData, tableData: tableData?.reverse(), tableColumn: columns });
            } else {
                setState({ orderChartData: {}, tableData: [], tableColumn: [] });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getSalesByCoupon = async () => {
        try {
            // if (categoryid?.length > 0) {
            let startDate: any, endDate: any;

            if (state.orderDateFilter == 'Last 7 Days') {
                const { start, end } = getDateRange('last7Days');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'This Month') {
                const { start, end } = getDateRange('thisMonth');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'Last Month') {
                const { start, end } = getDateRange('lastMonth');
                (startDate = start), (endDate = end);
            }
            if (state.orderDateFilter == 'Year') {
                const { start, end } = getDateRange('Year');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'Custom') {
                (startDate = moment(state.orderStartDate).format('YYYY-MM-DD')), (endDate = moment(state.orderEndDate).format('YYYY-MM-DD'));
            }

            const res = await salesByCoupon({
                variables: {
                    fromdate: startDate,
                    toDate: endDate,
                    // currency: state.orderCurrency,
                },
            });
            const response = res?.data?.salesByCoupon;

            const table = response?.dates?.map((date, index) => ({
                date,
                discountAmount: response?.discountAmount[index],
                noOfCouponsUsed: response?.noOfCouponsUsed[index],
            }));

            const tableColumn = [
                { accessor: 'date', title: 'Date' },
                { accessor: 'discountAmount', title: 'Discount Amount' },
                { accessor: 'noOfCouponsUsed', title: 'Number of coupon used' },
            ];

            const orderChartData = {
                series: [
                    { name: 'Discount Amount', type: 'line', data: table.map((item) => item?.discountAmount) },
                    { name: 'Number of coupon used', type: 'line', data: table.map((item) => item?.noOfCouponsUsed) },
                ],
                options: {
                    chart: {
                        height: 350,
                        type: 'line',
                        zoom: { enabled: false },
                        toolbar: { show: false },
                    },
                    colors: ['#FF0000', '#0000FF'],
                    stroke: { width: [2, 2, 2, 2, 2, 2, 2, 2] },
                    markers: {
                        size: 5,
                        colors: ['white'],
                        strokeColors: '#000000',
                        strokeWidth: 2,
                        hover: { size: 7 },
                    },
                    // title: { text: 'Metrics Over Time' },
                    dataLabels: { enabled: false },
                    xaxis: {
                        categories: table.map((item) => item.date),
                        tickPlacement: 'on',
                        title: { text: 'Date' },
                        labels: { rotate: -45, trim: true },
                    },
                    yaxis: {
                        title: { text: 'Values' },
                        min: 0,
                    },
                    tooltip: { shared: true },
                },
            };

            setState({ orderChartData, tableData: table, tableColumn });
            // } else {
            //     setState({ tableData: [], tableColumn: [] });
            // }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getAnalysisByOrder = async () => {
        try {
            let startDate: any, endDate: any;

            if (state.analysisDateFilter == 'Last 7 Days') {
                const { start, end } = getDateRange('last7Days');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'This Month') {
                const { start, end } = getDateRange('thisMonth');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'Last Month') {
                const { start, end } = getDateRange('lastMonth');
                (startDate = start), (endDate = end);
            }
            if (state.analysisDateFilter == 'Year') {
                const { start, end } = getDateRange('Year');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'Custom') {
                (startDate = moment(state.analysisStartDate).format('YYYY-MM-DD')), (endDate = moment(state.analysisEndDate).format('YYYY-MM-DD'));
            }
            let categoryIds = [];
            let countryCodeList = [];
            let productIds = [];

            if (state.analysisSelectedCountries?.length > 0) {
                countryCodeList = state.analysisSelectedCountries?.map((item) => item?.value);
            }

            if (state.analysisSelectedCategory?.length > 0) {
                categoryIds = state.analysisSelectedCategory?.map((item) => item?.value);
            }

            if (state.analysisSelectedProduct?.length > 0) {
                productIds = state.analysisSelectedProduct?.map((item) => item?.value);
            }

            const res = await analysisByOrder({
                variables: {
                    fromdate: startDate,
                    toDate: endDate,
                    categoryIds,
                    countryCodeList,
                    productIds,
                },
            });
            const response = res?.data?.orderAnalysis;

            const generateColumns = (dates) => {
                const columns = [{ accessor: 'country', title: 'Countries' }];
                dates.forEach((date, index) => {
                    columns.push({ accessor: `value${index + 1}`, title: date });
                });
                return columns;
            };

            const columns = generateColumns(response.dates);

            // Step 3: Populate Rows
            const rows = response.outputData.map((data) => {
                const row = { country: data[0] };
                data.slice(1).forEach((value, index) => {
                    row[`value${index + 1}`] = value;
                });
                return row;
            });

            if (rows.length > 0) {
                const categories = columns.filter((col) => col.accessor !== 'country').map((col) => col.title);
                const seriesData = rows.map((row) => ({
                    name: row.country,
                    data: categories.map((_, index) => parseFloat(row[`value${index + 1}`]) || 0),
                }));
                setAnalysisChartData(categories, seriesData);
                setState({ analysisTable: rows, analysisColumn: columns });
            } else {
                setState({ analysisTable: [], analysisChartData: {}, analysisColumn: [] });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getAnalysisByRevenue = async () => {
        try {
            let startDate: any, endDate: any;

            if (state.analysisDateFilter == 'Last 7 Days') {
                const { start, end } = getDateRange('last7Days');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'This Month') {
                const { start, end } = getDateRange('thisMonth');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'Last Month') {
                const { start, end } = getDateRange('lastMonth');
                (startDate = start), (endDate = end);
            }
            if (state.analysisDateFilter == 'Year') {
                const { start, end } = getDateRange('Year');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'Custom') {
                (startDate = moment(state.analysisStartDate).format('YYYY-MM-DD')), (endDate = moment(state.analysisEndDate).format('YYYY-MM-DD'));
            }
            let categoryIds = [];
            let countryCodeList = [];
            let productIds = [];

            if (state.analysisSelectedCountries?.length > 0) {
                countryCodeList = state.analysisSelectedCountries?.map((item) => item?.value);
            }

            if (state.analysisSelectedCategory?.length > 0) {
                categoryIds = state.analysisSelectedCategory?.map((item) => item?.value);
            }

            if (state.analysisSelectedProduct?.length > 0) {
                productIds = state.analysisSelectedProduct?.map((item) => item?.value);
            }

            const res = await analysisByRevenue({
                variables: {
                    fromdate: startDate,
                    toDate: endDate,
                    categoryIds,
                    countryCodeList,
                    productIds,
                    currency: state.analysisCurrency,
                },
            });
            const response = res?.data?.orderRevenue;

            const generateColumns = (dates) => {
                const columns = [{ accessor: 'country', title: 'Countries' }];
                dates.forEach((date, index) => {
                    columns.push({ accessor: `value${index + 1}`, title: date });
                });
                return columns;
            };

            const columns = generateColumns(response.dates);

            // Step 3: Populate Rows
            const rows = response.outputData.map((data) => {
                const row = { country: data[0] };
                data.slice(1).forEach((value, index) => {
                    row[`value${index + 1}`] = value;
                });
                return row;
            });

            if (rows.length > 0) {
                const categories = columns.filter((col) => col.accessor !== 'country').map((col) => col.title);

                const seriesData = rows.map((row) => ({
                    name: row.country,
                    data: categories.map((_, index) => parseFloat(row[`value${index + 1}`]) || 0),
                }));
                setAnalysisChartData(categories, seriesData);
                setState({ analysisTable: rows, analysisColumn: columns });
            } else {
                setState({ analysisTable: [], analysisChartData: {}, analysisColumn: [] });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getAnalysisByCustomer = async () => {
        try {
            let startDate: any, endDate: any;

            if (state.analysisDateFilter == 'Last 7 Days') {
                const { start, end } = getDateRange('last7Days');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'This Month') {
                const { start, end } = getDateRange('thisMonth');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'Last Month') {
                const { start, end } = getDateRange('lastMonth');
                (startDate = start), (endDate = end);
            }
            if (state.analysisDateFilter == 'Year') {
                const { start, end } = getDateRange('Year');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'Custom') {
                (startDate = moment(state.analysisStartDate).format('YYYY-MM-DD')), (endDate = moment(state.analysisEndDate).format('YYYY-MM-DD'));
            }
            let categoryIds = [];
            let countryCodeList = [];
            let productIds = [];

            if (state.analysisSelectedCountries?.length > 0) {
                countryCodeList = state.analysisSelectedCountries?.map((item) => item?.value);
            }

            if (state.analysisSelectedCategory?.length > 0) {
                categoryIds = state.analysisSelectedCategory?.map((item) => item?.value);
            }

            if (state.analysisSelectedProduct?.length > 0) {
                productIds = state.analysisSelectedProduct?.map((item) => item?.value);
            }

            const res = await analysisByCustomer({
                variables: {
                    fromdate: startDate,
                    toDate: endDate,
                    categoryIds,
                    countryCodeList,
                    productIds,
                    currency: state.analysisCurrency,
                },
            });

            const response = res?.data?.orderCustomer;

            const generateColumns = (data) => {
                return Object.keys(data)
                    .filter((key) => key !== '__typename')
                    .map((key) => {
                        return { accessor: key, title: key.charAt(0).toUpperCase() + key.slice(1) };
                    });
            };

            const generateRows = (data) => {
                const rowCount = data.countries.length;
                const rows = [];

                for (let i = 0; i < rowCount; i++) {
                    const row = {};
                    Object.keys(data).forEach((key) => {
                        if (key !== '__typename') {
                            row[key] = data[key][i];
                        }
                    });
                    rows.push(row);
                }

                return rows;
            };
            const columns = generateColumns(response);
            const rows = generateRows(response);

            if (rows.length > 0) {
                const categories = rows.map((row) => row.countries);
                const seriesData = columns
                    .filter((col) => col.accessor !== 'countries')
                    .map((col) => ({
                        name: col.title,
                        data: rows.map((row) => parseFloat(row[col.accessor]) || 0),
                    }));
                setAnalysisChartData(categories, seriesData);
                setState({ analysisTable: rows, analysisColumn: columns });
            } else {
                setState({ analysisTable: [], analysisChartData: {}, analysisColumn: [] });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getAnalysisProductByCountry = async () => {
        try {
            let startDate: any, endDate: any;

            if (state.analysisDateFilter == 'Last 7 Days') {
                const { start, end } = getDateRange('last7Days');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'This Month') {
                const { start, end } = getDateRange('thisMonth');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'Last Month') {
                const { start, end } = getDateRange('lastMonth');
                (startDate = start), (endDate = end);
            }
            if (state.analysisDateFilter == 'Year') {
                const { start, end } = getDateRange('Year');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'Custom') {
                (startDate = moment(state.analysisStartDate).format('YYYY-MM-DD')), (endDate = moment(state.analysisEndDate).format('YYYY-MM-DD'));
            }

            // const {startDate, endDate}=filterByDates(state.analysisDateFilter,state.analysisStartDate,state.analysisEndDate)

            let categoryIds = [];
            let countryCodeList = [];
            let productIds = [];

            if (state.analysisSelectedCountries?.length > 0) {
                countryCodeList = state.analysisSelectedCountries?.map((item) => item?.value);
            }

            if (state.analysisSelectedCategory?.length > 0) {
                categoryIds = state.analysisSelectedCategory?.map((item) => item?.value);
            }

            if (state.analysisSelectedProduct?.length > 0) {
                productIds = state.analysisSelectedProduct?.map((item) => item?.value);
            }

            const res = await productByCountry({
                variables: {
                    fromdate: startDate,
                    toDate: endDate,
                    categoryIds,
                    countryCodeList,
                    productIds,
                    currency: state.analysisCurrency,
                },
            });

            const response = res?.data?.orderSalesByCountry;

            const generateColumns = (data) => {
                return Object.keys(data)
                    .filter((key) => key !== '__typename') // Ignore __typename
                    .map((key) => {
                        return { accessor: key, title: key.charAt(0).toUpperCase() + key.slice(1) };
                    });
            };

            const generateRows = (data) => {
                const rowCount = data.countries.length;
                const rows = [];

                for (let i = 0; i < rowCount; i++) {
                    const row = {};
                    Object.keys(data)
                        .filter((key) => key !== '__typename') // Ignore __typename
                        .forEach((key) => {
                            row[key] = data[key][i];
                        });
                    rows.push(row);
                }

                return rows;
            };

            const columns = generateColumns(response);
            const rows = generateRows(response);
            if (rows.length > 0) {
                const categories = rows.map((row) => row.countries);
                const seriesData = columns
                    .filter((col) => col.accessor !== 'countries')
                    .map((col) => ({
                        name: col.title,
                        data: rows.map((row) => parseFloat(row[col.accessor]) || 0),
                    }));
                setAnalysisChartData(categories, seriesData);

                setState({ analysisTable: rows, analysisColumn: columns });
            } else {
                setState({ analysisTable: [], analysisChartData: {}, analysisColumn: [] });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getAnalysisByProductRevenue = async () => {
        try {
            let startDate: any, endDate: any;

            if (state.analysisDateFilter == 'Last 7 Days') {
                const { start, end } = getDateRange('last7Days');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'This Month') {
                const { start, end } = getDateRange('thisMonth');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'Last Month') {
                const { start, end } = getDateRange('lastMonth');
                (startDate = start), (endDate = end);
            }
            if (state.analysisDateFilter == 'Year') {
                const { start, end } = getDateRange('Year');
                (startDate = start), (endDate = end);
            }

            if (state.analysisDateFilter == 'Custom') {
                (startDate = moment(state.analysisStartDate).format('YYYY-MM-DD')), (endDate = moment(state.analysisEndDate).format('YYYY-MM-DD'));
            }
            let categoryIds = [];
            let countryCodeList = [];
            let productIds = [];

            if (state.analysisSelectedCountries?.length > 0) {
                countryCodeList = state.analysisSelectedCountries?.map((item) => item?.value);
            }

            if (state.analysisSelectedCategory?.length > 0) {
                categoryIds = state.analysisSelectedCategory?.map((item) => item?.value);
            }

            if (state.analysisSelectedProduct?.length > 0) {
                productIds = state.analysisSelectedProduct?.map((item) => item?.value);
            }

            const res = await analysisByProductRevenue({
                variables: {
                    fromdate: startDate,
                    toDate: endDate,
                    categoryIds,
                    countryCodeList,
                    productIds,
                    currency: state.analysisCurrency,
                },
            });

            const orderData = res.data.orderProductsAmountByCountry;

            // Generate columns
            const generateColumns = (data) => {
                const columns = [{ accessor: 'productName', title: 'Product Name' }];

                data.countries.forEach((country, index) => {
                    columns.push({ accessor: `country${index}`, title: country });
                });

                return columns;
            };

            // Generate rows
            const generateRows = (data) => {
                const rows = data.productsName.map((productName, productIndex) => {
                    const row = { productName };

                    data.countries.forEach((_, countryIndex) => {
                        row[`country${countryIndex}`] = data.outputData[countryIndex][productIndex + 1];
                    });

                    return row;
                });

                return rows;
            };

            // Generate columns and rows
            const columns = generateColumns(orderData);
            const rows = generateRows(orderData);
            if (rows.length > 0) {
                const categories = rows.map((row) => row.productName);

                // Generate series data for each country
                const seriesData = columns
                    .filter((col) => col.accessor !== 'productName') // Exclude the product name column
                    .map((col) => ({
                        name: col.title,
                        data: rows.map((row) => parseFloat(row[col.accessor]) || 0),
                    }));

                setAnalysisChartData(categories, seriesData);

                setState({ analysisTable: rows, analysisColumn: columns });
            } else {
                setState({ analysisTable: [], analysisChartData: {}, analysisColumn: [] });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const setAnalysisChartData = (categories, seriesData) => {
        const analysisChartData = {
            series: seriesData,
            options: {
                colors: generateColors(seriesData?.length), // You can generate colors dynamically if you have more countries or series
                plotOptions: {
                    bar: {
                        horizontal: false,
                        endingShape: 'rounded',
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    show: true,
                    width: 2,
                    colors: ['transparent'],
                },
                xaxis: {
                    categories: categories,
                    title: {
                        text: 'Dates',
                    },
                    labels: {
                        rotate: -45,
                        trim: true,
                    },
                },
                yaxis: {
                    title: {
                        text: 'Values',
                    },
                    min: 0,
                },
                title: {
                    text: '',
                },
                tooltip: {
                    shared: true,
                    intersect: false,
                },
                chart: {
                    zoom: { enabled: false }, // Disable zoom
                    toolbar: { show: false }, // Remove menu icons (toolbar)
                },
            },
        };
        setState({ analysisChartData });
    };

    const getGuestList = async () => {
        try {
            let startDate: any, endDate: any;

            if (state.customerDateFilter == 'Last 7 Days') {
                const { start, end } = getDateRange('last7Days');
                (startDate = start), (endDate = end);
            }

            if (state.customerDateFilter == 'This Month') {
                const { start, end } = getDateRange('thisMonth');
                (startDate = start), (endDate = end);
            }

            if (state.customerDateFilter == 'Last Month') {
                const { start, end } = getDateRange('lastMonth');
                (startDate = start), (endDate = end);
            }
            if (state.customerDateFilter == 'Year') {
                const { start, end } = getDateRange('Year');
                (startDate = start), (endDate = end);
            }

            if (state.customerDateFilter == 'Custom') {
                (startDate = moment(state.customerStartDate).format('YYYY-MM-DD')), (endDate = moment(state.customerEndDate).format('YYYY-MM-DD'));
            }

            const res = await guestList({
                variables: {
                    fromdate: startDate,
                    toDate: endDate,
                },
            });
            const response = res?.data?.questReport;

            const table = response?.lastOrderIds?.map((item, index) => ({
                email: response.emailList[index],
                lastOrder: response.lastOrder[index],
                lastOrderDate: response.lastOrderDate[index],
                moneySpentList: response.moneySpentList[index],
                nameList: response.nameList[index],
            }));
            const tableColumn = [
                { accessor: 'nameList', title: 'Name' },
                { accessor: 'email', title: 'Email' },
                { accessor: 'lastOrder', title: 'Last Order' },
                { accessor: 'lastOrderDate', title: 'Last Order Date' },
                { accessor: 'moneySpentList', title: 'Spend Money' },
            ];
            setState({ customerTable: table, customerColumn: tableColumn });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getCustomerList = async () => {
        try {
            const res = await customerList();
            const response = res?.data?.customerReport;
            const table = response?.nameList?.map((item, index) => ({
                name: item,
                emailList: response.emailList[index],
                moneySpentList: response.moneySpentList[index],
                lastOrder: response.lastOrder[index],
                lastOrderDate: response.lastOrderDate[index],
            }));
            const tableColumn = [
                { accessor: 'name', title: 'Name' },
                { accessor: 'emailList', title: 'Email' },
                { accessor: 'moneySpentList', title: 'Spend money' },
                { accessor: 'lastOrder', title: 'Last order' },
                { accessor: 'lastOrderDate', title: 'Last order date' },
            ];

            setState({ customerTable: table, customerColumn: tableColumn });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const cleanAndParseJSON = (str) => {
        str = str.replace(/'/g, '"').replace(/None/g, 'null');
        return JSON.parse(str);
    };

    const salesBydateTable = (data) => {
        const { giftwrapAmountList, codAmountList, dates, totalItemsSoldList, shippingAmountList, refundAmountList, noOfOrderList, couponAmountList, productsTotalAmount } = data;

        const table = dates?.map((date, index) => ({
            date,
            totalItemsSold: totalItemsSoldList[index],
            shippingAmount: shippingAmountList[index],
            refundAmount: refundAmountList[index],
            noOfOrders: noOfOrderList[index],
            couponAmount: couponAmountList[index],
            productsTotalAmount: productsTotalAmount[index],
            codAmountList: codAmountList[index],
            giftwrapAmountList: giftwrapAmountList[index],
        }));

        return table;
    };

    const downloadCSV = (type) => {
        const orderLabels = {
            'Sales by date': 'SaleByDate',
            'Sales by product': 'SaleByProduct',
            'Sales by category': 'SaleByCategory',
            'Coupons by date': 'CouponsByDate',
        };

        const customerLabels = {
            'Guests list': 'GuestsList',
            'Customer list': 'CustomerList',
        };

        const analysisLabels = {
            'Order Analysis': 'OrderAnalysis',
            'Revenue Analysis': 'RevenueAnalysis',
            'Customer Analysis': 'CustomerAnalysis',
            'Product by Country': 'ProductByCountry',
            'Product Revenue': 'ProductRevenue',
        };

        let label = '';

        if (type === 'Orders') {
            label = orderLabels[state.orderSubMenu] || '';
        } else if (type === 'Customers') {
            label = customerLabels[state.customerTab] || '';
        } else if (type === 'Analysis') {
            label = analysisLabels[state.analysisTab] || '';
        }

        if (type === 'Orders') {
            if (state.orderSubMenu == 'Sales by category') {
                const excelData = state.tableData?.map((item) => {
                    const res = { Date: item.date };
                    state.tableColumn?.forEach((column) => {
                        if (column.title !== 'Date') {
                            res[column.title] = item[column.title];
                        }
                    });

                    return res;
                });
                if (excelData.length > 0) {
                    downloadExlcel(formatKeysArray(excelData), label);
                } else {
                    Failure('No Excel data found');
                }
            } else {
                if (state.tableData.length > 0) {
                    downloadExlcel(formatKeysArray(state.tableData), label);
                } else {
                    Failure('No Excel data found');
                }
            }
        } else if (type === 'Customers') {
            if (state.customerTable?.length > 0) {
                downloadExlcel(formatKeysArray(state.customerTable), label);
            } else {
                Failure('No Excel data found');
            }
        } else if (type === 'Analysis') {
            if (state.analysisTab === 'Product Revenue' || state.analysisTab === 'Order Analysis' || state.analysisTab === 'Revenue Analysis') {
                const finalData = excelFormatData(state.analysisTable, state.analysisColumn);
                if (finalData?.length > 0) {
                    downloadExlcel(finalData, label);
                } else {
                    Failure('No Excel data found');
                }
            } else {
                if (state.analysisTable?.length > 0) {
                    downloadExlcel(state.analysisTable, label);
                } else {
                    Failure('No Excel data found');
                }
            }
        }
    };

    const excelFormatData = (countryData: any, columnInfo: any) => {
        return countryData.map((country: any) => {
            let newObj = {};

            columnInfo.forEach((col: any) => {
                if (col.accessor === 'country') {
                    newObj[col.title] = country[col.accessor];
                } else {
                    newObj[col.title] = country[col.accessor];
                }
            });

            return newObj;
        });
    };

    return (
        <>
            <div className="panel text-xl">{state.activeTab}</div>
            <Tab.Group>
                <Tab.List className=" mt-5 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                    {['Orders', 'Customers', 'Analysis'].map((tab) => (
                        <Tab as={Fragment} key={tab}>
                            {({ selected }) => (
                                <button
                                    onClick={() => {
                                        setState({
                                            activeTab: tab,
                                            orderSubMenu: 'Sales by date',
                                            orderDateFilter: 'Last 7 Days',
                                            dateFilter: 'Last 7 Days',
                                            orderCurrency: 'All Currencies',
                                            analysisTab: 'Order Analysis',
                                            analysisCurrency: 'All Currencies',
                                            productSearch: '',
                                            analysisDateFilter: 'Last 7 Days',
                                            customerDateFilter: 'Last 7 Days',
                                            customerTab: 'Guests list',
                                        });
                                    }}
                                    className={tabClassNames(selected)}
                                >
                                    {tab}
                                </button>
                            )}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels>
                    {/* -----------------------Sub menu start----------------------------------------- */}

                    {/* Order Tab */}
                    <Tab.Panel>
                        {/* Main Filter Sale by date,product,category */}
                        <div className="flex  ">
                            {order?.map((link, index) => (
                                <React.Fragment key={index}>
                                    <div
                                        onClick={() => {
                                            if (link == 'Sales by product') {
                                                setState({ activeAccordion: 'topSellers' });
                                            }
                                            setState({ orderSubMenu: link });
                                        }}
                                        className={`dark:hover:text-primary-dark hover: px-4 py-2 ${link == state.orderSubMenu ? 'text-primary' : ' border-gray-300'} border-r`}
                                    >
                                        {link?.split(' ')?.map((word, i) => (
                                            <React.Fragment key={i}>
                                                <span className="text-md cursor-pointer">{word}</span>
                                                {i !== link.split(' ').length - 1 && <span className="mx-1 border-b-2 border-black"></span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </Tab.Panel>
                    {/* Customer Tab */}
                    <Tab.Panel>
                        <div className="flex   ">
                            {customer?.map((link, index) => (
                                <React.Fragment key={index}>
                                    <div
                                        onClick={() => setState({ customerTab: link })}
                                        className={`dark:hover:text-primary-dark hover: px-4 py-2 ${link == state.customerTab ? 'text-primary' : ' border-gray-300'} border-r`}
                                    >
                                        {link?.split(' ')?.map((word, i) => (
                                            <React.Fragment key={i}>
                                                <span className="text-md cursor-pointer">{word}</span>
                                                {i !== link.split(' ').length - 1 && <span className="mx-1 border-b-2 border-black"></span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </Tab.Panel>
                    {/* Analysis Tab */}
                    <Tab.Panel>
                        {/* Main Filter Sale by date,product,category */}
                        <div className="flex  ">
                            {analysis?.map((link, index) => (
                                <React.Fragment key={index}>
                                    <div
                                        onClick={() => setState({ analysisTab: link })}
                                        className={`dark:hover:text-primary-dark hover: px-4 py-2 ${link == state.analysisTab ? 'text-primary' : ' border-gray-300'} border-r`}
                                    >
                                        {link?.split(' ')?.map((word, i) => (
                                            <React.Fragment key={i}>
                                                <span className="text-md cursor-pointer">{word}</span>
                                                {i !== link.split(' ').length - 1 && <span className="mx-1 border-b-2 border-black"></span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </Tab.Panel>
                    {/* ----------------------------Sub menu end---------------------------------------- */}
                    {state.activeTab == 'Orders' ? (
                        <div className="panel mt-5 ">
                            {/* Filter By last 7 days,last month year */}
                            <div className="flex items-center justify-between">
                                <div className="flex  items-center  ">
                                    {orderFilter?.map((link, index) => (
                                        <React.Fragment key={index}>
                                            <div
                                                onClick={() => {
                                                    setState({ orderDateFilter: link });
                                                    if (state.orderSubMenu == 'Sales by product') {
                                                        setState({ activeAccordion: 'topSellers' });
                                                    }
                                                }}
                                                className={`dark:hover:text-primary-dark hover: px-4 py-2 ${link == state.orderDateFilter ? 'text-primary' : ' border-gray-300'} border`}
                                            >
                                                {link?.split(' ')?.map((word, i) => (
                                                    <React.Fragment key={i}>
                                                        <span className="text-md cursor-pointer">{word}</span>
                                                        {i !== link.split(' ').length - 1 && <span className="border-b-1 mx-1 border-black"></span>}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    {state.orderSubMenu !== 'Coupons by date' && (
                                        <div className="pl-4">
                                            <select className="form-select w-[180px]" value={state.orderCurrency} onChange={(e) => setState({ orderCurrency: e.target.value })}>
                                                <option value="All Currencies">All Currencies</option>
                                                <option value="INR">INR</option>
                                                <option value="USD">USD</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="flex cursor-pointer gap-2 border p-3" onClick={() => downloadCSV('Orders')}>
                                    <IconDownload />
                                    <div className="cursor-pointer">Export CSV</div>
                                </div>
                            </div>
                            {state.orderDateFilter == 'Custom' && (
                                <div className="mt-3 flex   items-center gap-4">
                                    <div className="">
                                        <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                            From :
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={state.orderStartDate}
                                            onChange={(e) => {
                                                setState({ orderStartDate: e.target.value });
                                            }}
                                            id="dateTimeCreated"
                                            name="dateTimeCreated"
                                            className="form-input"
                                            max={getCurrentDateTime()}
                                            // min={mintDateTime(state.orderStartDate)}
                                        />
                                    </div>
                                    <div className="">
                                        <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                            To:
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={state.orderEndDate}
                                            onChange={(e) => {
                                                setState({ orderEndDate: e.target.value });
                                            }}
                                            id="dateTimeCreated"
                                            name="dateTimeCreated"
                                            className="form-input"
                                            max={getCurrentDateTime()}
                                            // min={mintDateTime(state.orderStartDate)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 grid w-full grid-cols-12 gap-3">
                                <div className="col-span-3">
                                    {/* Sale by date data */}
                                    {state.orderSubMenu == 'Sales by date' ? (
                                        state.salesByDate?.map((link, index) => (
                                            <React.Fragment key={index}>
                                                <div
                                                    style={{ borderRightWidth: '3px', borderRightColor: getBorderColor(index), height: '80px' }} // Adjust the height as needed
                                                    // onClick={() => setState({ orderIndex: index })}
                                                    className={`dark:hover:text-primary-dark mb-4  border border-gray-300 px-4 py-2  dark:hover:bg-gray-700`}

                                                    // className={`dark:hover:text-primary-dark hover: mb-4 cursor-pointer px-4 py-2 ${'border-gray-300'} border`}
                                                >
                                                    <div className="text-md text-bold  text-lg ">{`${link.value}`}</div>
                                                    <div className="text-md   text-[16px]">{link.name}</div>
                                                </div>
                                            </React.Fragment>
                                        ))
                                    ) : state.orderSubMenu == 'Sales by product' ? (
                                        <div className="mx-auto  w-full max-w-md">
                                            <div className="mb-4">
                                                <button
                                                    onClick={() => toggleAccordion('search')}
                                                    className="flex w-full items-center justify-between bg-gray-200 p-4 text-lg font-medium dark:bg-gray-800"
                                                >
                                                    Product Search
                                                    <span>{state.activeAccordion === 'search' ? '-' : '+'}</span>
                                                </button>
                                                {state.activeAccordion === 'search' && (
                                                    <div className="border border-t-0 border-gray-300 p-4 dark:border-gray-700">
                                                        <div className="pl-4">
                                                            <ProductSelect
                                                                loading={productLoading}
                                                                queryFunc={fetchProducts}
                                                                selectedCategory={state.productSearch}
                                                                onCategoryChange={(data) => setState({ productSearch: data })}
                                                                isMulti={false}
                                                            />

                                                            {/* <Select
                                                                placeholder="Select a product"
                                                                options={state.productList}
                                                                value={state.productSearch}
                                                                onChange={(e) => {
                                                                    setState({ productSearch: e });
                                                                }}
                                                                isSearchable={true}
                                                                onInputChange={(inputValue, { action }) => {
                                                                    if (action === 'input-change') {
                                                                        getProductSearch(inputValue); // Only pass the actual input value
                                                                    }
                                                                }}
                                                            /> */}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <button type="button" className="btn btn-primary mt-3 h-9" onClick={() => getSalesBySingleProduct('search', state.productSearch?.value)}>
                                                                Submit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary mt-3 h-9"
                                                                onClick={() => {
                                                                    setState({ productSearch: '' });
                                                                    // getSalesByProduct();
                                                                    setState({ tableData: [], tableColumn: [] });
                                                                }}
                                                            >
                                                                Reset
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <button
                                                    onClick={() => toggleAccordion('topSellers')}
                                                    className="flex w-full items-center justify-between bg-gray-200 p-4 text-lg font-medium dark:bg-gray-800"
                                                >
                                                    Top Sellers
                                                    <span>{state.activeAccordion === 'topSellers' ? '-' : '+'}</span>
                                                </button>
                                                {state.activeAccordion === 'topSellers' && (
                                                    <div className="border border-t-0 border-gray-300 p-4 dark:border-gray-700">
                                                        {state.topSellers?.length > 0 ? (
                                                            <>
                                                                {state.topSellers?.map((item, index) => (
                                                                    <div
                                                                        key={item}
                                                                        className={`cursor-pointer py-1 underline ${
                                                                            item?.variant__product__id == state.selectedTopSeller ? 'text-primary' : 'text-black'
                                                                        }`}
                                                                        onClick={() => {
                                                                            getSalesBySingleProduct('select', item?.variant__product__id);
                                                                            setState({ selectedTopSeller: item?.variant__product__id });
                                                                        }}
                                                                    >
                                                                        {`${item?.variant__product__id} ${item?.variant__product__name}`}
                                                                    </div>
                                                                ))}
                                                                {state.selectedTopSeller !== ''}
                                                                {
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-primary mt-3 h-9"
                                                                        onClick={() => {
                                                                            setState({ selectedTopSeller: '' });
                                                                            getSalesBySingleProduct('select', '');
                                                                        }}
                                                                    >
                                                                        Reset
                                                                    </button>
                                                                }
                                                            </>
                                                        ) : (
                                                            <div>No Product found</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : state.orderSubMenu == 'Sales by category' ? (
                                        <div className="mb-4">
                                            <button className="flex w-full items-center justify-between bg-gray-200 p-4 text-lg font-medium dark:bg-gray-800"> Categories</button>
                                            <div className="border border-t-0 border-gray-300 p-4 dark:border-gray-700">
                                                {/* <Select
                                                    isMulti
                                                    value={state.selectedCategory}
                                                    onChange={(data: any) => setState({ selectedCategory: data })}
                                                    options={state.categoryList}
                                                    placeholder="Select categories..."
                                                    className="form-select"
                                                /> */}

                                                <CategorySelect
                                                    queryFunc={fetchCategories} // Pass the function to fetch categories
                                                    placeholder="Select categories"
                                                    title="Categories"
                                                    selectedCategory={state.selectedCategory}
                                                    onCategoryChange={(data: any) => setState({ selectedCategory: data })}
                                                />

                                                {/* <button type="button" className="btn btn-primary mt-3 h-9" onClick={() => getSalesByCategory(state.selectedCategory)}>
                                                    Submit
                                                </button> */}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                                <div className={`${state.orderSubMenu !== 'Coupons by date' ? 'col-span-9' : 'col-span-12'} `}>
                                    <div className="datatables">
                                        {salesBydateLoading || salesByProductLoading || salesBySingleProductLoading || salesByCategoryLoading || salesByCouponLoading ? (
                                            <CommonLoader />
                                        ) : (
                                            <>
                                                {state.orderChartData?.series?.length > 0 && state.tableData?.length > 0 && (
                                                    <div className="panel mb-5">
                                                        <div className="mb-5 flex items-center justify-between">
                                                            <h5 className="text-lg font-semibold dark:text-white-light">{state.orderSubMenu}</h5>
                                                        </div>
                                                        <div className="mb-5">
                                                            <ReactApexChart
                                                                series={state.orderChartData.series}
                                                                options={state.orderChartData.options}
                                                                className="rounded-lg bg-white dark:bg-black"
                                                                type={'line'}
                                                                height={500}
                                                                width={'100%'}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <DataTable
                                                    withBorder={true}
                                                    className="table-hover whitespace-nowrap"
                                                    records={state.tableData}
                                                    columns={state.tableColumn}
                                                    highlightOnHover
                                                    totalRecords={state.tableData?.length}
                                                    recordsPerPage={10}
                                                    page={null}
                                                    onPageChange={(p) => {}}
                                                    recordsPerPageOptions={[10, 20, 30]}
                                                    onRecordsPerPageChange={() => {}}
                                                    minHeight={200}
                                                    paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : state.activeTab == 'Customers' ? (
                        <div className="panel  ">
                            <div className={`flex items-center ${state.customerTab == 'Customer list' ? 'justify-end' : ' justify-between'}`}>
                                {state.customerTab !== 'Customer list' && (
                                    <div className="flex  items-center  ">
                                        {orderFilter?.map((link, index) => (
                                            <React.Fragment key={index}>
                                                <div
                                                    onClick={() => setState({ customerDateFilter: link })}
                                                    className={`dark:hover:text-primary-dark hover: px-4 py-2 ${link == state.customerDateFilter ? 'text-primary' : ' border-gray-300'} border`}
                                                >
                                                    {link?.split(' ')?.map((word, i) => (
                                                        <React.Fragment key={i}>
                                                            <span className="text-md cursor-pointer">{word}</span>
                                                            {i !== link.split(' ').length - 1 && <span className="border-b-1 mx-1 border-black"></span>}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                                <div className="flex cursor-pointer gap-2 border p-3" onClick={() => downloadCSV('Customers')}>
                                    <IconDownload />
                                    <div className="cursor-pointer">Export CSV</div>
                                </div>
                            </div>

                            {state.customerDateFilter == 'Custom' && (
                                <div className="mt-3 flex   items-center gap-4">
                                    <div className="">
                                        <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                            From :
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={state.customerStartDate}
                                            onChange={(e) => {
                                                setState({ customerStartDate: e.target.value });
                                            }}
                                            id="dateTimeCreated"
                                            name="dateTimeCreated"
                                            className="form-input"
                                            // max={getCurrentDateTime()}
                                        />
                                    </div>
                                    <div className="">
                                        <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                            To:
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={state.customerEndDate}
                                            onChange={(e) => {
                                                setState({ customerEndDate: e.target.value });
                                            }}
                                            id="dateTimeCreated"
                                            name="dateTimeCreated"
                                            className="form-input"
                                            // max={getCurrentDateTime()}
                                            // min={mintDateTime(startDate || new Date())}
                                        />
                                    </div>
                                </div>
                            )}
                            {customerListLoading || guestListLoading ? (
                                <CommonLoader />
                            ) : (
                                <>
                                    {state.customerTab == 'Customer list' && <h5 className="pb-5 text-lg font-semibold dark:text-white-light">Customers {`(${state.customerTable?.length})`}</h5>}

                                    <div className=" mt-5 items-center justify-center">
                                        <div className="datatables">
                                            <DataTable
                                                className="table-hover whitespace-nowrap"
                                                records={state.customerTable}
                                                columns={state.customerColumn}
                                                highlightOnHover
                                                totalRecords={state.tableData?.length}
                                                recordsPerPage={10}
                                                page={null}
                                                onPageChange={(p) => {}}
                                                recordsPerPageOptions={[10, 20, 30]}
                                                onRecordsPerPageChange={() => null}
                                                // sortStatus={}
                                                // onSortStatusChange={setSortStatus}
                                                selectedRecords={null}
                                                onSelectedRecordsChange={(selectedRecords) => null}
                                                minHeight={200}
                                                paginationText={({ from, to, totalRecords }) => null}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="panel mt-5 ">
                            {/* Filter By last 7 days,last month year */}
                            <div className="flex items-center justify-between">
                                <div className="flex  items-center  ">
                                    {orderFilter?.map((link, index) => (
                                        <React.Fragment key={index}>
                                            <div
                                                onClick={() => setState({ analysisDateFilter: link })}
                                                className={`dark:hover:text-primary-dark hover: px-4 py-2 ${link == state.analysisDateFilter ? 'text-primary' : ' border-gray-300'} border`}
                                            >
                                                {link?.split(' ')?.map((word, i) => (
                                                    <React.Fragment key={i}>
                                                        <span className="text-md cursor-pointer">{word}</span>
                                                        {i !== link.split(' ').length - 1 && <span className="border-b-1 mx-1 border-black"></span>}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    {state.analysisTab !== 'Order Analysis' && state.analysisTab !== 'Product by Country' && state.analysisTab !== 'Product Revenue' && (
                                        <div className="pl-4">
                                            <select className="form-select w-[180px]" value={state.analysisCurrency} onChange={(e) => setState({ analysisCurrency: e.target.value })}>
                                                <option value="All Currencies">All Currencies</option>
                                                <option value="INR">INR</option>
                                                <option value="USD">USD</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="flex cursor-pointer gap-2 border p-3" onClick={() => downloadCSV('Analysis')}>
                                    <IconDownload />
                                    <div className="cursor-pointer">Export CSV</div>
                                </div>
                            </div>
                            {state.analysisDateFilter == 'Custom' && (
                                <div className="mt-3 flex   items-center gap-4">
                                    <div className="">
                                        <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                            From :
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={state.analysisStartDate}
                                            onChange={(e) => {
                                                setState({ analysisStartDate: e.target.value });
                                            }}
                                            id="dateTimeCreated"
                                            name="dateTimeCreated"
                                            className="form-input"
                                            // max={getCurrentDateTime()}
                                        />
                                    </div>
                                    <div className="">
                                        <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                            To:
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={state.analysisEndDate}
                                            onChange={(e) => {
                                                setState({ analysisEndDate: e.target.value });
                                            }}
                                            id="dateTimeCreated"
                                            name="dateTimeCreated"
                                            className="form-input"
                                            // max={getCurrentDateTime()}
                                            // min={mintDateTime(startDate || new Date())}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 grid w-full grid-cols-12 gap-3">
                                <div className="col-span-3">
                                    {/* Sale by date data */}
                                    <div className="mb-4">
                                        <button className="flex w-full items-center justify-between bg-gray-200 p-4 text-lg font-medium dark:bg-gray-800">Products</button>
                                        <div className="border border-t-0 border-gray-300 p-4 dark:border-gray-700">
                                            {/* <Select
                                                placeholder="Select products "
                                                options={state.analysisProductList}
                                                value={state.analysisSelectedProduct}
                                                onChange={(e: any) => setState({ analysisSelectedProduct: e })}
                                                isSearchable={true}
                                                isMulti
                                            /> */}

                                            <ProductSelect
                                                loading={productLoading}
                                                queryFunc={fetchProducts}
                                                selectedCategory={state.analysisSelectedProduct}
                                                onCategoryChange={(data) => setState({ analysisSelectedProduct: data })}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <button className="flex w-full items-center justify-between bg-gray-200 p-4 text-lg font-medium dark:bg-gray-800"> Categories</button>
                                        <div className="border border-t-0 border-gray-300 p-4 dark:border-gray-700">
                                            {/* <Select
                                                placeholder="Select categories"
                                                options={state.categoryList}
                                                value={state.analysisSelectedCategory}
                                                onChange={(data: any) => setState({ analysisSelectedCategory: data })}
                                                isSearchable={true}
                                                isMulti
                                            /> */}
                                            <CategorySelect
                                                queryFunc={fetchCategories} // Pass the function to fetch categories
                                                placeholder="Select categories"
                                                title="Categories"
                                                selectedCategory={state.analysisSelectedCategory}
                                                onCategoryChange={(data: any) => setState({ analysisSelectedCategory: data })}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <button className="flex w-full items-center justify-between bg-gray-200 p-4 text-lg font-medium dark:bg-gray-800"> Countries</button>
                                        <div className="border border-t-0 border-gray-300 p-4 dark:border-gray-700">
                                            <Select
                                                placeholder="Select countries"
                                                options={state.countryList}
                                                value={state.analysisSelectedCountries}
                                                onChange={(data: any) => setState({ analysisSelectedCountries: data })}
                                                isSearchable={true}
                                                isMulti
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-9">
                                    {state.analysisChartData.series?.length > 0 && (
                                        <div className="panel mb-5">
                                            <div className="mb-5 flex items-center justify-between">
                                                <h5 className="text-lg font-semibold dark:text-white-light">{state.analysisTab}</h5>
                                            </div>
                                            <div className="mb-5 ">
                                                <ReactApexChart
                                                    series={state.analysisChartData.series}
                                                    options={state.analysisChartData.options}
                                                    className="overflow-scroll rounded-lg bg-white dark:bg-black"
                                                    type="bar"
                                                    height={500}
                                                    width={'100%'}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="datatables">
                                        <DataTable
                                            className="table-hover whitespace-nowrap"
                                            records={state.analysisTable}
                                            columns={state.analysisColumn}
                                            highlightOnHover
                                            totalRecords={state.tableData?.length}
                                            recordsPerPage={10}
                                            page={null}
                                            onPageChange={(p) => {}}
                                            recordsPerPageOptions={[10, 20, 30]}
                                            onRecordsPerPageChange={() => null}
                                            // sortStatus={}
                                            // onSortStatusChange={setSortStatus}
                                            selectedRecords={null}
                                            onSelectedRecordsChange={(selectedRecords) => null}
                                            minHeight={200}
                                            paginationText={({ from, to, totalRecords }) => null}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Tab.Panels>
            </Tab.Group>
        </>
    );
};

export default PrivateRouter(Reports);
