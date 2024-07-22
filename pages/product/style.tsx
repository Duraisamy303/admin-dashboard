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
import { CREATE_DESIGN, CREATE_FINISH, CREATE_STYLE, DELETE_FINISH, DELETE_STYLE, FINISH_LIST, STYLE_LIST, UPDATE_DESIGN, UPDATE_FINISH, UPDATE_STYLE } from '@/query/product';
import { useMutation, useQuery } from '@apollo/client';
import IconLoader from '@/components/Icon/IconLoader';
import PrivateRouter from '@/components/Layouts/PrivateRouter';

const Style = () => {
    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Style'));
    });

    const {
        error,
        data: finishData,
        refetch: styleRefetch,
    } = useQuery(STYLE_LIST, {
        variables: { channel: 'india-channel', first: 20 },
    });

    const [finishList, setFinishList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [createStyleLoader, setCreateStyleLoader] = useState(false);
    const [updateStyleLoader, setUpdateStyleLoader] = useState(false);

    useEffect(() => {
        getFinishList();
    }, [finishData]);

    const getFinishList = () => {
        setLoading(true);
        if (finishData) {
            if (finishData && finishData.productStyles && finishData.productStyles?.edges?.length > 0) {
                const newData = finishData.productStyles.edges.map((item: any) => ({
                    ...item.node,
                    name: item?.node?.name,
                }));
                setFinishList(newData);
                setLoading(false);
            } else {
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
        setInitialRecords(finishList);
    }, [finishList]);

    // Log initialRecords when it changes

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
    const [addFinish] = useMutation(CREATE_STYLE);
    const [updateFinish] = useMutation(UPDATE_STYLE);
    const [deleteDesign] = useMutation(DELETE_STYLE);
    const [bulkDelete] = useMutation(DELETE_STYLE);

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
            return finishList.filter((item: any) => {
                return (
                    // item.id.toString().includes(search.toLowerCase()) ||
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
        setCreateStyleLoader(true);
        setUpdateStyleLoader(true);
        try {
            setCreateStyleLoader(true);
            setUpdateStyleLoader(true);
            const variables = {
                input: {
                    name: record.name,
                },
            };

            const { data } = await (modalTitle ? updateFinish({ variables: { ...variables, id: modalContant.id } }) : addFinish({ variables }));

            const newData = modalTitle ? data?.productStyleUpdate?.productStyle : data?.productStyleCreate?.productStyle;
            await styleRefetch();

            // if (!newData) {
            //     console.error('Error: New data is undefined.');
            //     return;
            // }
            // const updatedId = newData.id;
            // const index = recordsData.findIndex((design: any) => design && design.id === updatedId);

            // const updatedDesignList: any = [...recordsData];
            // if (index !== -1) {
            //     updatedDesignList[index] = newData;
            // } else {
            //     updatedDesignList.push(newData);
            // }

            // // setFinishList(updatedDesignList);
            // setRecordsData(updatedDesignList);
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
            setCreateStyleLoader(false);
            setUpdateStyleLoader(false);
        } catch (error) {
            setCreateStyleLoader(false);
            setUpdateStyleLoader(false);
            console.log('error: ', error);
        }
    };

    // category table edit
    const EditFinish = (record: any) => {
        setModal1(true);
        setModalTitle(record);
        setModalContant(record);
    };

    // category table create
    const CreateFinish = () => {
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

    const BulkDeleteFinish = async () => {
        showDeleteAlert(
            async () => {
                if (selectedRecords.length === 0) {
                    Swal.fire('Cancelled', 'Please select at least one record!', 'error');
                    return;
                }
                selectedRecords?.map(async (item: any) => {
                    await bulkDelete({ variables: { id: item.id } });
                });
                const updatedRecordsData = finishList.filter((record) => !selectedRecords.includes(record));
                setFinishList(updatedRecordsData);
                setSelectedRecords([]);
                await styleRefetch();
                Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your List is safe :)', 'error');
            }
        );
    };

    const DeleteFinish = (record: any) => {
        showDeleteAlert(
            async () => {
                const { data } = await deleteDesign({ variables: { id: record.id } });
                const updatedRecordsData = finishList.filter((dataRecord: any) => dataRecord.id !== record.id);
                setRecordsData(updatedRecordsData);
                setFinishList(updatedRecordsData);
                // getFinishList()
                setSelectedRecords([]);
                await styleRefetch();
                // setFinishList(finishList)
                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Finish List is safe :)', 'error');
            }
        );
    };

    // completed category delete option

    return (
        <div>
            <div className="panel mt-6">
                <div className="mb-5 flex-col gap-5 md:flex md:flex-row md:items-center ">
                    <h5 className="text-lg font-semibold dark:text-white-light">Style</h5>

                    <div className="mt-5 md:mt-0 md:flex  md:ltr:ml-auto md:rtl:mr-auto">
                        <input type="text" className="form-input mb-3 mr-2 w-full md:mb-0 md:w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <div className="dropdown  mb-3 mr-0  md:mb-0 md:mr-2  ">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="btn btn-outline-primary dropdown-toggle md:w-auto w-full"
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
                                        <button type="button" onClick={() => BulkDeleteFinish()}>
                                            Delete
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                        <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => CreateFinish()}>
                            + Create
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
                                            <Tippy content="Edit">
                                                <button type="button" onClick={() => EditFinish(row)}>
                                                    <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                                </button>
                                            </Tippy>
                                            <Tippy content="Delete">
                                                <button type="button" onClick={() => DeleteFinish(row)}>
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

            {/* CREATE AND EDIT CATEGORY FORM */}
            <Transition appear show={modal1} as={Fragment}>
                <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">{modalTitle === null ? 'Create Style' : 'Edit Style'}</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal1(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="mb-5 p-5">
                                        <Formik
                                            initialValues={
                                                modalContant === null
                                                    ? { name: '' }
                                                    : {
                                                          name: modalContant?.name,
                                                          //   description: modalContant?.description,

                                                          //   count: modalContant?.count,
                                                          //   image: modalContant?.image,
                                                          //   parentCategory: modalContant?.name,
                                                      }
                                            }
                                            validationSchema={SubmittedForm}
                                            onSubmit={(values, { resetForm }) => {
                                                onSubmit(values, { resetForm }); // Call the onSubmit function with form values and resetForm method
                                            }}
                                        >
                                            {({ errors, submitCount, touched, setFieldValue, values }: any) => (
                                                <Form className="space-y-5">
                                                    {/* <div className={submitCount ? (errors.image ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="image">Image</label>
                                                        <input
                                                            id="image"
                                                            name="image"
                                                            type="file"
                                                            onChange={(event: any) => {
                                                                setFieldValue('image', event.currentTarget.files[0]);
                                                            }}
                                                            className="form-input"
                                                        />
                                                        {values.image && typeof values.image === 'string' && (
                                                            <img src={values.image} alt="Product Image" style={{ width: '30px', height: 'auto', paddingTop: '5px' }} />
                                                        )}
                                                        {submitCount ? errors.image ? <div className="mt-1 text-danger">{errors.image}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div> */}

                                                    <div className={submitCount ? (errors.name ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="fullName">Name </label>
                                                        <Field name="name" type="text" id="fullName" placeholder="Enter Name" className="form-input" />

                                                        {submitCount ? errors.name ? <div className="mt-1 text-danger">{errors.name}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div>

                                                    {/* <div className={submitCount ? (errors.description ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="description">description </label>
                                                        <Field name="description" as="textarea" id="description" placeholder="Enter Description" className="form-input" />

                                                        {submitCount ? (
                                                            errors.description ? (
                                                                <div className="mt-1 text-danger">{errors.description}</div>
                                                            ) : (
                                                                <div className="mt-1 text-success"></div>
                                                            )
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div> */}

                                                    {/* <div className={submitCount ? (errors.slug ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="slug">Slug </label>
                                                        <Field name="slug" type="text" id="slug" placeholder="Enter Description" className="form-input" />

                                                        {submitCount ? errors.slug ? <div className="mt-1 text-danger">{errors.slug}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div> */}

                                                    {/* <div className={submitCount ? (errors.count ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="count">Count</label>
                                                        <Field name="count" type="number" id="count" placeholder="Enter Count" className="form-input" />

                                                        {submitCount ? errors.count ? <div className="mt-1 text-danger">{errors.count}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div> */}

                                                    {/* <div className={submitCount ? (errors.parentCategory ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="parentCategory">Parent Category</label>
                                                        <Field as="select" name="parentCategory" className="form-select">
                                                            <option value="">Open this select menu</option>
                                                            <option value="Anklets">Anklets</option>
                                                            <option value="BlackThread">__Black Thread</option>
                                                            <option value="Kada">__Kada</option>
                                                        </Field>
                                                        {submitCount ? (
                                                            errors.parentCategory ? (
                                                                <div className=" mt-1 text-danger">{errors.parentCategory}</div>
                                                            ) : (
                                                                <div className=" mt-1 text-[#1abc9c]"></div>
                                                            )
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div> */}

                                                    <button type="submit" className="btn btn-primary !mt-6">
                                                        {createStyleLoader || updateStyleLoader ? (
                                                            <IconLoader className="me-3 h-4 w-4 shrink-0 animate-spin" />
                                                        ) : modalTitle === null ? (
                                                            'Submit'
                                                        ) : (
                                                            'Update'
                                                        )}
                                                    </button>
                                                </Form>
                                            )}
                                        </Formik>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Full View Category data*/}
            {/* <Transition appear show={viewModal} as={Fragment}>
                <Dialog as="div" open={viewModal} onClose={() => setViewModal(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">View Category</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setViewModal(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="mb-5 p-5"></div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition> */}
        </div>
    );
};

export default PrivateRouter(Style);
