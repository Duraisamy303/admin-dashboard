import { CATEGORY_LIST, PARENT_CATEGORY_LIST, PRODUCT_EXPORT } from '@/query/product';
import { Failure, downloadExlcel, useSetState } from '@/utils/functions';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import React from 'react';
import Select from 'react-select';
import Loader from './elements/loader';
import IconLoader from '@/components/Icon/IconLoader';
import { useRouter } from 'next/router';
import PrivateRouter from '@/components/Layouts/PrivateRouter';

const Product_export = () => {
    const { data: exportData, refetch: exportDatarefetch } = useQuery(PRODUCT_EXPORT);

    const router = useRouter();

    const [state, setState] = useSetState({
        loading: false,
        category: '',
    });

    const { data: categoryList } = useQuery(CATEGORY_LIST, {
        variables: {
            first: 500,
            after: null,
            channel: 'india-channel',
        },
    });

    const { data: parentList } = useQuery(PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });


    const ArrayToString = (array) => {
        let label = '';
        if (array?.length > 0) {
            label = array?.map((item: any) => item.name).join(',');
        }
        return label;
    };

    const ArrayToImg = (array) => {
        let label = '';
        if (array?.length > 0) {
            label = array?.map((item: any) => item.url).join(',');
        }
        return label;
    };

    const IsPublished = (array) => {
        let label = 0;
        if (array?.length > 0) {
            label = array[0]?.isPublished == true ? 1 : 0;
        }
        return label;
    };

    const generateCSV = async () => {
        try {
            setState({ loading: true });
            let hasNextPage = true;
            let after = null;
            let allData = [];

            while (hasNextPage) {
                let cat = [];
                if (state.category) {
                    cat = [state.category];
                }
                const res = await exportDatarefetch({
                    first: 200,
                    after: after,
                    categories: cat,
                });

                const edges = res.data.productVariants?.edges;
                const pageInfo = res.data.productVariants?.pageInfo;

                if (!pageInfo || !edges) {
                    console.error('Invalid response structure:', res);
                    setState({ loading: false });

                    throw new Error('Invalid response structure');
                }

                allData = [...allData, ...edges];
                after = pageInfo.endCursor;
                hasNextPage = pageInfo.hasNextPage;
            }
            setState({ loading: false });

            const excelData = allData?.map((item: any) => {
                const data = item?.node;
                const product = data?.product;
                let res: any = {
                    ID: product?.productId,
                    SKU: data?.sku,
                    Name: product?.name,
                    // TaxStatus: '',
                    TaxClass: product?.taxClass?.name,
                    'In Stock': data?.stocks?.length > 0 ? (data?.stocks[0]?.quantity > 0 ? 'Yes' : 'No') : 'No',
                    Stock: data?.stocks?.length > 0 ? data?.stocks[0]?.quantity : 0,
                    Price: data?.pricing?.price?.gross?.amount,
                    Category: product?.category?.name,
                    Tags: ArrayToString(product?.tags),
                    Images: ArrayToImg(product?.media),
                    Upsells: ArrayToString(product?.getUpsells),
                    'Cross-sells': ArrayToString(product?.getCrosssells),
                    Position: product?.orderNo,
                    Sizes: ArrayToString(product?.productSize),
                    'Item Types': ArrayToString(product?.productItemtype),
                    'Stone Types': ArrayToString(product?.productStoneType),
                    Designs: ArrayToString(product?.prouctDesign),
                    Styles: ArrayToString(product?.productstyle),
                    Finishes: ArrayToString(product?.productFinish),
                    'Stone Colors': ArrayToString(product?.productStonecolor),
                    Published: IsPublished(product?.channelListings),
                };

                if (product?.metadata?.length > 0) {
                    const shortDescription = product?.metadata?.find((meta) => meta.key === 'short_description')?.value;
                    const description = product?.description;
                    if (description) {
                        res.Description = description;
                    } else {
                        res.Description = '';
                    }
                    if (shortDescription) {
                        res['Short description'] = shortDescription;
                    } else {
                        res['Short description'] = '';
                    }
                } else {
                    res['Short description'] = '';
                    res.Description = '';
                }

                return res;
            });

            if (excelData?.length > 0) {
                downloadExlcel(excelData, 'Export Products');
            } else {
                Failure('No Data Found');
            }
        } catch (error) {
            setState({ loading: false });

            console.error('Error:', error);
        }
    };

    return (
        <div>
            <div className="panel mb-5 flex items-center justify-between gap-3 p-5 ">
                <h3 className="text-lg font-semibold dark:text-white-light">Export Products</h3>
            </div>
            <div className=" flex w-full items-center justify-center text-center">
                <div className="panel w-full p-4 text-center">
                    <h3 className="text-lg font-semibold dark:text-white-light ">Export products to a CSV file</h3>
                    <div className="active mt-4 flex items-center justify-center">
                        <div className="mb-5 mr-4 pr-6">
                            <label htmlFor="upsells" className="block pr-5 text-sm font-medium text-gray-700">
                                Which product category should be exported?
                            </label>
                        </div>
                        <div className="mb-5">
                            <select className="form-select flex-1" value={state.category} onChange={(e) => setState({ category: e.target.value })}>
                                <option value="">Select a Categories </option>
                                {parentList?.categories?.edges?.map((item: any) => {
                                    return (
                                        <>
                                            <option value={item?.node?.id}>{item.node?.name}</option>
                                            {item?.node?.children?.edges.map((child: any) => (
                                                <option key={child.id} value={child.node?.id} style={{ paddingLeft: '20px' }}>
                                                    -- {child.node?.name}
                                                </option>
                                            ))}
                                        </>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-5">
                        <div className="mb-5">
                            {state.loading ? (
                                <button type="button" className="btn btn-primary ">
                                    <IconLoader className="inline-block shrink-0 animate-[spin_2s_linear_infinite] align-middle ltr:mr-2 rtl:ml-2" />
                                    Loading
                                </button>
                            ) : (
                                <button type="button" className="btn btn-primary " onClick={generateCSV}>
                                    Generate CSV
                                </button>
                            )}
                        </div>
                        <div className="mb-5">
                            <button type="button" className="btn btn-primary " onClick={() => router.push('/')}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivateRouter(Product_export);
