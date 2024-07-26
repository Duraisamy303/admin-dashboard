import { LOW_STOCK_LIST } from '@/query/product';
import { useLazyQuery, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CommonLoader from './elements/commonLoader';
import { DataTable } from 'mantine-datatable';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';

const LowStock = () => {
    const router = useRouter();
    const PAGE_SIZE = 20;

    const [recordsData, setRecordsData] = useState([]);
    const [startCursor, setStartCursor] = useState(null);
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [search, setSearch] = useState('');

    const { loading: getLoading, refetch: productSearchRefetch } = useQuery(LOW_STOCK_LIST, {
        variables: {
            channel: 'india-channel',
            first: PAGE_SIZE,
            after: null,
            filter: {
                categories: [],
                stockAvailability: 'OUT_OF_STOCK',
            },
        },
        onCompleted: (data) => {
            const products = data?.products?.edges;
            const pageInfo = data?.products?.pageInfo;
            setRecordsData(tableFormat(products));
            setStartCursor(pageInfo?.startCursor || null);
            setEndCursor(pageInfo?.endCursor || null);
            setHasNextPage(pageInfo?.hasNextPage || false);
            setHasPreviousPage(pageInfo?.hasPreviousPage || false);
        },
    });

    const [fetchNextPage] = useLazyQuery(LOW_STOCK_LIST, {
        onCompleted: (data) => {
            const products = data?.products?.edges;
            const pageInfo = data?.products?.pageInfo;
            setRecordsData(tableFormat(products));
            setStartCursor(pageInfo?.startCursor || null);
            setEndCursor(pageInfo?.endCursor || null);
            setHasNextPage(pageInfo?.hasNextPage || false);
            setHasPreviousPage(pageInfo?.hasPreviousPage || false);
        },
    });

    const [fetchPreviousPage] = useLazyQuery(LOW_STOCK_LIST, {
        onCompleted: (data) => {
            const products = data?.products?.edges;
            const pageInfo = data?.products?.pageInfo;
            setRecordsData(tableFormat(products));
            setStartCursor(pageInfo?.startCursor || null);
            setEndCursor(pageInfo?.endCursor || null);
            setHasNextPage(pageInfo?.hasNextPage || false);
            setHasPreviousPage(pageInfo?.hasPreviousPage || false);
        },
    });

    const tableFormat = (products) => {
        return products.map((product) => ({
            name: product?.node?.name,
            id: product?.node?.id,
        }));
    };

    const handleNextPage = () => {
        fetchNextPage({
            variables: {
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: endCursor,
                filter: {
                    categories: [],
                    stockAvailability: 'OUT_OF_STOCK',
                },
            },
        });
    };

    const handlePreviousPage = () => {
        fetchPreviousPage({
            variables: {
                channel: 'india-channel',
                last: PAGE_SIZE,
                before: startCursor,
                filter: {
                    categories: [],
                    stockAvailability: 'OUT_OF_STOCK',
                },
            },
        });
    };

    return (
        <div>
            <div className="panel mb-5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">Out Of Stocks</h5>
                <input
                    type="text"
                    className="form-input mb-3 mr-2 w-full md:mb-0 md:w-auto"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="datatables">
                {getLoading ? (
                    <CommonLoader />
                ) : (
                    <>
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={recordsData}
                            columns={[
                                {
                                    accessor: 'name',
                                    sortable: true,
                                    title: 'Product Name',
                                    render: (row) => (
                                        <div className="cursor-pointer" onClick={() => router.push(`/apps/product/edit?id=${row.id}`)}>
                                            {row.name}
                                        </div>
                                    ),
                                },
                            ]}
                            highlightOnHover
                            minHeight={200}
                        />
                        <div className="mt-5 flex justify-end gap-3">
                            <button disabled={!hasPreviousPage} onClick={handlePreviousPage} className={`btn ${!hasPreviousPage ? 'btn-disabled' : 'btn-primary'}`}>
                                <IconArrowBackward />
                            </button>
                            <button disabled={!hasNextPage} onClick={handleNextPage} className={`btn ${!hasNextPage ? 'btn-disabled' : 'btn-primary'}`}>
                                <IconArrowForward />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PrivateRouter(LowStock);
