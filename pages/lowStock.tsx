import IconTrashLines from '@/components/Icon/IconTrashLines';
import { LOW_STOCK_LIST } from '@/query/product';
import { useLazyQuery, useQuery } from '@apollo/client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import CommonLoader from './elements/commonLoader';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';

const LowStock = () => {
    const router = useRouter();

    const PAGE_SIZE = 10;

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [lowStockData, setLowStockData] = useState([]);
    const [initialData, setInitialData] = useState([]);

    const [recordsData, setRecordsData] = useState([]);
    const [startCursor, setStartCursor] = useState(null);
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const {
        data: customerData,
        loading: getLoading,
        refetch: stockListRefetch,
    } = useQuery(LOW_STOCK_LIST, {
        variables: {
            channel: 'india-channel',
            first: PAGE_SIZE,
            after: null,
            search: search !== '' ? search : '',
            filter: {
                categories: [],
                stockAvailability: 'OUT_OF_STOCK',
            },
        },
        onCompleted: (data) => {
            console.log('data: ', data);
            commonPagination(data);
        },
    });

    const { data, refetch: refetch } = useQuery(LOW_STOCK_LIST);

    const [fetchNextPage] = useLazyQuery(LOW_STOCK_LIST, {
        onCompleted: (data) => {
            commonPagination(data);
        },
    });

    const [fetchPreviousPage] = useLazyQuery(LOW_STOCK_LIST, {
        onCompleted: (data) => {
            commonPagination(data);
        },
    });

    const commonPagination = (data) => {
        const lowStaock = data?.products?.edges;
        const pageInfo = data?.products?.pageInfo;
        const newData = lowStaock?.map((item: any) => {
            return {
                ...item.node,
                name: item?.node?.name || '',
                id: item?.node?.id,
            };
        });
        setRecordsData(newData);
        setStartCursor(pageInfo?.startCursor || null);
        setEndCursor(pageInfo?.endCursor || null);
        setHasNextPage(pageInfo?.hasNextPage || false);
        setHasPreviousPage(pageInfo?.hasPreviousPage || false);
    };

    const handleNextPage = () => {
        fetchNextPage({
            variables: {
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: endCursor,
                search: search !== '' ? search : '',
                before: null,
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
                search: search !== '' ? search : '',

                filter: {
                    categories: [],
                    stockAvailability: 'OUT_OF_STOCK',
                },
            },
        });
    };

    const refresh = async () => {
        try {
            const { data } = await refetch({
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: null,
                search: '',
                filter: {
                    categories: [],
                    stockAvailability: 'OUT_OF_STOCK',
                },
            });
            commonPagination(data);
        } catch (error) {
            console.log('error: ', error);
        }
    };
    const handleSearchChange = async () => {
        const res = await stockListRefetch({
            variables: {
                channel: 'india-channel',
                last: PAGE_SIZE,
                before: startCursor,
                search: search,

                filter: {
                    categories: [],
                    stockAvailability: 'OUT_OF_STOCK',
                },
            },
        });
        commonPagination(res?.data);
    };

    useEffect(() => {
        if (search == '' && search == undefined) {
            refresh();
        } else {
            handleSearchChange();
        }
    }, [search]);

    return (
        <div className="">
            <div className="panel mb-5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">Out Of Stocks</h5>
                <input type="text" className="form-input  mb-3 mr-2 w-full md:mb-0 md:w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="datatables">
                {getLoading ? (
                    <CommonLoader />
                ) : (
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={recordsData}
                        columns={[
                            {
                                accessor: 'name',
                                sortable: true,
                                title: 'Product Name',
                                render: (row) => (
                                    <div className="cursor-pointer" onClick={() => window.open(`/apps/product/edit?id=${row.id}`, '_blank')}>
                                        {row.name}
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={recordsData?.length}
                        recordsPerPage={PAGE_SIZE}
                        minHeight={200}
                        page={null}
                        onPageChange={(p) => {}}
                        withBorder={true}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                    />
                )}
                <div className="mt-5 flex justify-end gap-3">
                    <button disabled={!hasPreviousPage} onClick={handlePreviousPage} className={`btn ${!hasPreviousPage ? 'btn-disabled' : 'btn-primary'}`}>
                        <IconArrowBackward />
                    </button>
                    <button disabled={!hasNextPage} onClick={handleNextPage} className={`btn ${!hasNextPage ? 'btn-disabled' : 'btn-primary'}`}>
                        <IconArrowForward />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivateRouter(LowStock);
