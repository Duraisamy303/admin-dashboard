import { formatOptions, useSetState } from '@/utils/functions';
import React, { useEffect } from 'react';
import Select from 'react-select';

export default function CategorySelect({
    queryFunc,
    placeholder = 'Select categories',
    selectedCategory, 
    onCategoryChange, 
    initialFetchParams = { first: 20, query: '', channel: 'india-channel' }, 
    isMulti = true, 
    clearable = true,
    title = '',
}) {
    const [state, setState] = useSetState({
        catOption: [],
        hasNext: false,
        after: null,
        searchInput: '',
    });

    useEffect(() => {
        categoryList();
    }, []);

    const categoryList = async (query = '', after = null) => {
        const res = await queryFunc({ ...initialFetchParams, after, query });
        const formattedOptions = formatOptions(res?.data?.categories?.edges); 
        const pageInfo = res?.data?.categories?.pageInfo;
        setState({
            catOption: after ? [...state.catOption, ...formattedOptions] : formattedOptions,
            hasNext: pageInfo?.hasNextPage,
            after: pageInfo?.endCursor,
        });
    };

    const handleMenuScrollToBottom = async () => {
        if (state.hasNext) {
            categoryList(state.searchInput, state.after);
        }
    };

    const getProductSearch = async (inputValue) => {
        setState((prevState) => ({ ...prevState, searchInput: inputValue }));
        categoryList(inputValue);
    };

    const handleCategoryChange = (selected) => {
        onCategoryChange(selected);
       
        if (selected && selected.length === 1) {
            setState({ catOption: [], hasNext: false, after: null });
        }
        categoryList(); 
    };

    const showSelect = isMulti || (selectedCategory && selectedCategory.length < 1);

    return (
        <div className="">
            {title && (
                <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                    {title ? title : 'Categories'}
                </label>
            )}
                <Select
                    placeholder={placeholder}
                    options={state.catOption}
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    isSearchable={true}
                    isMulti={isMulti}
                    isLoading={false}
                    onInputChange={(inputValue, { action }) => {
                        if (action === 'input-change') {
                            getProductSearch(inputValue);
                        }
                    }}
                    onMenuScrollToBottom={handleMenuScrollToBottom}
                    isClearable={clearable}
                    closeMenuOnSelect={!isMulti} 
                    blurInputOnSelect={false}
                    styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }), 
                        menu: (base) => ({ ...base, zIndex: 9999 }), 
                    }}
                />
        </div>
    );
}
