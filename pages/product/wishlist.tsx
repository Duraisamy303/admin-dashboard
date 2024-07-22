import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconBell from '@/components/Icon/IconBell';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import IconPencil from '@/components/Icon/IconPencil';
import { Button, Loader } from '@mantine/core';
import Dropdown from '../../components/Dropdown';
import IconCaretDown from '@/components/Icon/IconCaretDown';

import { Dialog, Transition } from '@headlessui/react';
import IconX from '@/components/Icon/IconX';
import Image1 from '@/public/assets/images/profile-1.jpeg';
import Image2 from '@/public/assets/images/profile-2.jpeg';
import Image3 from '@/public/assets/images/profile-3.jpeg';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import IconEye from '@/components/Icon/IconEye';
import { useMutation, useQuery } from '@apollo/client';
import { CATEGORY_LIST, CREATE_CATEGORY, DELETE_CATEGORY, PRODUCT_LIST, UPDATE_CATEGORY } from '@/query/product';
import ReactQuill from 'react-quill';

const Wishlist = () => {
    const isRtl = useSelector((state:any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Checkbox Table'));
    });

    const { error, data: categoryData } = useQuery(CATEGORY_LIST, {
        variables: { channel: 'india-channel', first: 100 },
    });

    const [categoryList, setCategoryList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getCategoryList();
    }, [categoryData]);

    const getCategoryList = () => {
        setLoading(true);
        if (categoryData) {
            if (categoryData.categories && categoryData.categories.edges) {
                const newData = categoryData.categories.edges.map((item: any) => {
                    const jsonObject = JSON.parse(item.node.description || item.node.description);
                    // Extract the text value
                    const textValue = jsonObject?.blocks[0]?.data?.text;

                    return {
                        ...item.node,

                        product: item.node.products?.totalCount,
                        textdescription: textValue || '', // Set textValue or empty string if it doesn't exist
                    };
                });
                setCategoryList(newData);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState([]); // Initialize initialRecords with an empty array
    const [recordsData, setRecordsData] = useState([]);

    // Update initialRecords whenever finishList changes
    useEffect(() => {
        // Sort finishList by 'id' and update initialRecords
        setInitialRecords(sortBy(categoryList, 'id'));
    }, [categoryList]);

  

    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [modal1, setModal1] = useState(false);
    const [modalTitle, setModalTitle] = useState(null);
    const [modalContant, setModalContant] = useState<any>(null);

    // const [viewModal, setViewModal] = useState(false);

    //Mutation
    const [addCategory] = useMutation(CREATE_CATEGORY);
    const [updateCategory] = useMutation(UPDATE_CATEGORY);
    const [deleteCategory] = useMutation(DELETE_CATEGORY);
    const [bulkDelete] = useMutation(DELETE_CATEGORY);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return categoryList.filter((item: any) => {
                return (
                    item.id.toString().includes(search.toLowerCase()) ||
                    // item.image.toLowerCase().includes(search.toLowerCase()) ||
                    item.name.toLowerCase().includes(search.toLowerCase())
                    // item.description.toLowerCase().includes(search.toLowerCase()) ||
                    // item.slug.toLowerCase().includes(search.toLowerCase()) ||
                    // item.count.toString().includes(search.toLowerCase())
                );
            });
        });
    }, [search]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [sortStatus]);

    // FORM VALIDATION
    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required('Please fill the Name'),
        // description: Yup.string().required('Please fill the Description'),
        // slug: Yup.string().required('Please fill the Slug'),
        // count: Yup.string().required('Please fill the count'),
        // image: Yup.string().required('Please fill the Image'),
        // parentCategory: Yup.string().required('Please fill the Parent Category'),
    });

    // form submit
    const onSubmit = async (record: any, { resetForm }: any) => {
        try {
            const Description = JSON.stringify({ time: Date.now(), blocks: [{ id: 'some-id', data: { text: record.description }, type: 'paragraph' }], version: '2.24.3' });

            const variables = {
                input: {
                    name: record.name,
                    description: Description,
                },
            };

            const { data } = await (modalTitle ? updateCategory({ variables: { ...variables, id: modalContant.id } }) : addCategory({ variables }));

            const newData = modalTitle ? data?.categoryUpdate?.category : data?.categoryCreate?.category;
            if (!newData) {
                console.error('Error: New data is undefined.');
                return;
            }

            const jsonObject = JSON.parse(newData.description || newData.description);
            // Extract the text value
            const textValue = jsonObject?.blocks[0]?.data?.text;

            const finalData = {
                ...newData,
                textdescription: textValue || '',
            };

            const updatedId = finalData.id;
            const index = recordsData.findIndex((design: any) => design && design.id === updatedId);

            const updatedDesignList: any = [...recordsData];
            if (index !== -1) {
                updatedDesignList[index] = finalData;
            } else {
                updatedDesignList.push(finalData);
            }
            // setCategoryList(updatedDesignList);
            setRecordsData(updatedDesignList);
            const toast = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000,
            });
            toast.fire({
                icon: modalTitle ? 'success' : 'info',
                title: modalTitle ? 'Data updated successfully' : 'New data added successfully',
                padding: '10px 20px',
            });

            setModal1(false);
            resetForm();
        } catch (error) {
            console.log('error: ', error);
        }
    };

    // category table edit
    const EditCategory = (record: any) => {
        setModal1(true);
        setModalTitle(record);
        setModalContant(record);
    };

    // category table create
    const CreateWishlist = () => {
        setModal1(true);
        setModalTitle(null);
        setModalContant(null);
    };

    // view categotry
    // const ViewCategory = (record: any) => {
    //     setViewModal(true);
    // };

    // delete Alert Message
    const showDeleteAlert = (onConfirm: () => void, onCancel: () => void) => {
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
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, cancel!',
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

    const BulkDeleteCategory = async () => {
        showDeleteAlert(
            () => {
                if (selectedRecords.length === 0) {
                    Swal.fire('Cancelled', 'Please select at least one record!', 'error');
                    return;
                }
                selectedRecords?.map(async (item: any) => {
                    await bulkDelete({ variables: { id: item.id } });
                });
                const updatedRecordsData = categoryList.filter((record) => !selectedRecords.includes(record));
                setCategoryList(updatedRecordsData);
                setSelectedRecords([]);
                Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Product List is safe :)', 'error');
            }
        );
    };

    const DeleteCategory = (record: any) => {
        showDeleteAlert(
            async () => {
                const { data } = await deleteCategory({ variables: { id: record.id } });
                const updatedRecordsData = categoryList.filter((dataRecord: any) => dataRecord.id !== record.id);
                setRecordsData(updatedRecordsData);
                setCategoryList(updatedRecordsData);
                // getCategoryList()
                setSelectedRecords([]);
                // setCategoryList(finishList)
                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Finish List is safe :)', 'error');
            }
        );
    };
    return (
        <div>
            <div className="panel mt-6">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Wishlist</h5>

                    <div className="flex ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input mr-2 w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <div className="dropdown  mr-2 ">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="btn btn-outline-primary dropdown-toggle"
                                button={
                                    <>
                                        Bulk Actions
                                        <span>
                                            <IconCaretDown className="inline-block ltr:ml-1 rtl:mr-1" />
                                        </span>
                                    </>
                                }
                            >
                                <ul className="!min-w-[170px]">
                                    <li>
                                        <button type="button" onClick={() => BulkDeleteCategory()}>
                                            Delete
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                        {/* <button type="button" className="btn btn-primary" onClick={() => CreateWishlist()}>
                            + Create
                        </button> */}
                    </div>
                </div>
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="dropdown  mr-2 ">
                        <Dropdown
                            placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                            btnClassName="btn btn-outline-primary dropdown-toggle"
                            button={
                                <>
                                    Select a Product
                                    <span>
                                        <IconCaretDown className="inline-block ltr:ml-1 rtl:mr-1" />
                                    </span>
                                </>
                            }
                        >
                            <ul className="!min-w-[120px]">
                                <li>
                                    <button type="button">Select a Product</button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>
                    <div className="dropdown  mr-2 ">
                        <Dropdown
                            placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                            btnClassName="btn btn-outline-primary dropdown-toggle"
                            button={
                                <>
                                    Filter by Registered Customer
                                    <span>
                                        <IconCaretDown className="inline-block ltr:ml-1 rtl:mr-1" />
                                    </span>
                                </>
                            }
                        >
                            <ul className="!min-w-[120px]">
                                <li>
                                    <button type="button">Customer Name</button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>
                    <div>
                        <button type="button" className="btn btn-primary" >
                            Filter
                        </button>
                    </div>
                </div>
                {loading ? (
                    <Loader />
                ) : (
                    <div className="datatables">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={recordsData}
                            columns={[
                                // { accessor: 'id', sortable: true },
                                // { accessor: 'image', sortable: true, render: (row) => <img src={row.image} alt="Product" className="h-10 w-10 object-cover ltr:mr-2 rtl:ml-2" /> },
                                { accessor: 'name', sortable: true },
                                {
                                    accessor: 'textdescription',
                                    sortable: true,
                                    title: 'Description',
                                },
                                {
                                    accessor: 'product',
                                    sortable: true,
                                },

                                {
                                    // Custom column for actions
                                    accessor: 'actions', // You can use any accessor name you want
                                    title: 'Actions',
                                    // Render method for custom column
                                    render: (row: any) => (
                                        <>
                                            {/* <Tippy content="View">
                                            <button type="button" onClick={() => ViewCategory(row)}>
                                                <IconEye className="ltr:mr-2 rtl:ml-2" />
                                            </button>
                                        </Tippy> */}
                                            {/* <Tippy content="Edit">
                                                <button type="button" onClick={() => EditCategory(row)}>
                                                    <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                                </button>
                                            </Tippy> */}
                                            <Tippy content="Delete">
                                                <button type="button" onClick={() => DeleteCategory(row)}>
                                                    <IconTrashLines />
                                                </button>
                                            </Tippy>
                                        </>
                                    ),
                                },
                            ]}
                            highlightOnHover
                            totalRecords={initialRecords.length}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            selectedRecords={selectedRecords}
                            onSelectedRecordsChange={(selectedRecords) => {
                                setSelectedRecords(selectedRecords);
                            }}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
