import React, { useState, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import 'tippy.js/dist/tippy.css';
import moment from 'moment';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import CommonLoader from './elements/commonLoader';
import { ABANDONT_CART_LIST, PRODUCT_PREV_PAGINATION } from '@/query/product';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import { useRouter } from 'next/router';
import IconEdit from '@/components/Icon/IconEdit';

const PAGE_SIZE = 20;

const AbandonedCarts = () => {
    const router = useRouter();

    const [recordsData, setRecordsData] = useState([]);
    const [startCursor, setStartCursor] = useState(null);
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [status, setStatus] = useState(null);

    const { loading: getLoading, refetch: fetchLowStockList } = useQuery(ABANDONT_CART_LIST, {
        variables: {
            channel: 'india-channel',
            first: PAGE_SIZE,
            after: null,
        },
        onCompleted: (data) => {
            const products = data?.abandonedCarts?.edges;
            const pageInfo = data?.abandonedCarts?.pageInfo;
            setRecordsData(tableFormat(products));
            setStartCursor(pageInfo?.startCursor || null);
            setEndCursor(pageInfo?.endCursor || null);
            setHasNextPage(pageInfo?.hasNextPage || false);
            setHasPreviousPage(pageInfo?.hasPreviousPage || false);
        },
    });

    const [fetchNextPage] = useLazyQuery(ABANDONT_CART_LIST, {
        onCompleted: (data) => {
            const products = data?.abandonedCarts?.edges;
            const pageInfo = data?.abandonedCarts?.pageInfo;
            setRecordsData(tableFormat(products));
            setStartCursor(pageInfo?.startCursor || null);
            setEndCursor(pageInfo?.endCursor || null);
            setHasNextPage(pageInfo?.hasNextPage || false);
            setHasPreviousPage(pageInfo?.hasPreviousPage || false);
        },
    });

    const [fetchPreviousPage] = useLazyQuery(ABANDONT_CART_LIST, {
        onCompleted: (data) => {
            const products = data?.abandonedCarts?.edges || [];
            const pageInfo = data?.abandonedCarts?.pageInfo;
            setRecordsData(tableFormat(products));
            setStartCursor(pageInfo?.startCursor || null);
            setEndCursor(pageInfo?.endCursor || null);
            setHasNextPage(pageInfo?.hasNextPage || false);
            setHasPreviousPage(pageInfo?.hasPreviousPage || false);
        },
    });

    const handleNextPage = () => {
        fetchNextPage({
            variables: {
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: endCursor,
            },
        });
    };

    const handlePreviousPage = () => {
        fetchPreviousPage({
            variables: {
                channel: 'india-channel',
                last: PAGE_SIZE,
                before: startCursor,
            },
        });
    };

    return (
        <div>
            <div className="panel mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">Abandoned Carts</h5>
            </div>
            <div className="panel mt-6">
                {getLoading ? (
                    <CommonLoader />
                ) : (
                    <div className="datatables">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={recordsData}
                            columns={[
                                {
                                    accessor: 'name',
                                    sortable: true,

                                    render: (row) => (
                                        <div className="cursor-pointer text-info underline" onClick={() => window.open(`/customer/edit?id=${row.customerId}`,"_blank")}>
                                            {row.name}
                                        </div>
                                    ),
                                },
                                { accessor: 'email', sortable: true },
                                {
                                    accessor: 'product',
                                    sortable: true,
                                    render: (row) => (
                                        <button className="flex text-info underline" onClick={() => window.open(`http://www1.prade.in/product-details/${row.productId}`, '_blank')}>
                                            {row.product}
                                        </button>
                                    ),
                                },

                                { accessor: 'note', sortable: true },
                                { accessor: 'date', sortable: true },
                            ]}
                            highlightOnHover
                            totalRecords={recordsData.length}
                            recordsPerPage={PAGE_SIZE}
                            page={null} // Add this line to set the current page
                            onPageChange={(p) => {}} // Dummy handler for onPageChange
                            sortStatus={{
                                columnAccessor: 'name',
                                direction: 'asc',
                            }}
                            onSortStatusChange={() => {}}
                            withBorder={true}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) => ''}
                        />
                        <div className="mt-5 flex justify-end gap-3">
                            <button disabled={!hasPreviousPage} onClick={handlePreviousPage} className={`btn ${!hasPreviousPage ? 'btn-disabled' : 'btn-primary'}`}>
                                <IconArrowBackward />
                            </button>
                            <button disabled={!hasNextPage} onClick={handleNextPage} className={`btn ${!hasNextPage ? 'btn-disabled' : 'btn-primary'}`}>
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
        name: `${product?.node?.customer?.firstName} ${product?.node?.customer?.firstName}`,
        email: product?.node?.customer?.email,
        note: product?.node?.logNote,
        date: moment(product.node?.time).format('YYYY/MM/DD [at] h:mm a'),
        customerId: product?.node?.customer?.id,
        product: product?.node?.productName,
        productId: product?.node?.productId,
    }));
};

export default PrivateRouter(AbandonedCarts);
