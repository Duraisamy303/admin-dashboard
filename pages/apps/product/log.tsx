import React, { useState, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { DataTable } from 'mantine-datatable';
import 'tippy.js/dist/tippy.css';
import moment from 'moment';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import CommonLoader from '../../elements/commonLoader';
import { PRODUCT_FULL_DETAILS, PRODUCT_LOG } from '@/query/product';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import { useRouter } from 'next/router';

const PAGE_SIZE = 20;

const Log = () => {
    const router = useRouter();
    const id = router?.query?.id;
    const [recordsData, setRecordsData] = useState([]);
    const [startCursor, setStartCursor] = useState(null);
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [productName, setProductName] = useState('');

    const { data: productDetails, refetch: productDetailsRefetch } = useQuery(PRODUCT_FULL_DETAILS);

    useEffect(() => {
        if (id) {
            getProductDetails();
            fetchLogs();
        }
    }, [id]);

    const getProductDetails = async () => {
        try {
            const res = await productDetailsRefetch({
                channel: 'india-channel',
                id,
            });
            setProductName(res?.data?.product?.name);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const { loading: getLoading, refetch: fetchLogs } = useQuery(PRODUCT_LOG, {
        variables: {
            productid: id,
            first: PAGE_SIZE,
            after: null,
            last: null,
            before: null,
        },
        onCompleted: (data) => {
            const products = data?.productlogs?.edges;
            const pageInfo = data?.productlogs?.pageInfo;
            setRecordsData(tableFormat(products));
            setStartCursor(pageInfo?.startCursor || null);
            setEndCursor(pageInfo?.endCursor || null);
            setHasNextPage(pageInfo?.hasNextPage || false);
            setHasPreviousPage(pageInfo?.hasPreviousPage || false);
        },
    });

    const [fetchNextPage] = useLazyQuery(PRODUCT_LOG, {
        onCompleted: (data) => {
            const products = data?.productlogs?.edges;
            const pageInfo = data?.productlogs?.pageInfo;
            setRecordsData(tableFormat(products));
            setStartCursor(pageInfo?.startCursor || null);
            setEndCursor(pageInfo?.endCursor || null);
            setHasNextPage(pageInfo?.hasNextPage || false);
            setHasPreviousPage(pageInfo?.hasPreviousPage || false);
        },
    });

    const [fetchPreviousPage] = useLazyQuery(PRODUCT_LOG, {
        onCompleted: (data) => {
            const products = data?.productlogs?.edges || [];
            const pageInfo = data?.productlogs?.pageInfo;
            setRecordsData(tableFormat(products));
            setStartCursor(pageInfo?.startCursor || null);
            setEndCursor(pageInfo?.endCursor || null);
            setHasNextPage(pageInfo?.hasNextPage || false);
            setHasPreviousPage(pageInfo?.hasPreviousPage || false);
        },
    });

    const handleNextPage = () => {
        if (endCursor) {
            fetchNextPage({
                variables: {
                    productid: id,
                    first: PAGE_SIZE,
                    after: endCursor,
                    last: null,
                    before: null,
                },
            });
        }
    };

    const handlePreviousPage = () => {
        if (startCursor) {
            fetchPreviousPage({
                variables: {
                    productid: id,
                    first: null,
                    after: null,
                    last: PAGE_SIZE,
                    before: startCursor,
                },
            });
        }
    };

    return (
        <div>
            <div className="">
                <div className="panel mb-5 flex items-center justify-between gap-5">
                    <div className="flex items-center gap-5">
                        <h5 className="text-lg font-semibold dark:text-white-light">{`(${productName}) Logs`}</h5>
                    </div>
                </div>

                {getLoading ? (
                    <CommonLoader />
                ) : (
                    <div className="datatables">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={recordsData}
                            columns={[
                                { accessor: 'date', sortable: true },
                                { accessor: 'log', sortable: true },
                            ]}
                            highlightOnHover
                            totalRecords={recordsData.length}
                            recordsPerPage={PAGE_SIZE}
                            page={null}
                            onPageChange={() => {}}
                            sortStatus={{
                                columnAccessor: 'name',
                                direction: 'asc',
                            }}
                            onSortStatusChange={() => {}}
                            withBorder={true}
                            minHeight={200}
                            paginationText={() => ''}
                        />
                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                disabled={!hasPreviousPage}
                                onClick={handlePreviousPage}
                                className={`btn ${!hasPreviousPage ? 'btn-disabled' : 'btn-primary'}`}
                            >
                                <IconArrowBackward />
                            </button>
                            <button
                                disabled={!hasNextPage}
                                onClick={handleNextPage}
                                className={`btn ${!hasNextPage ? 'btn-disabled' : 'btn-primary'}`}
                            >
                                <IconArrowForward />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const tableFormat = (products) => {
    return products.map((product) => ({
        log: product?.node?.log,
        date: product.node?.date ? moment(product.node?.date).format('YYYY/MM/DD [at] h:mm a') : '-',
    }));
};

export default PrivateRouter(Log);
