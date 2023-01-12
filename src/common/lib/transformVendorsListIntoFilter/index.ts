import { FiltersType } from 'src/parts/dto/SearchPartsDto'

export const transformVendorsListIntoFilter = (
  filters: FiltersType,
  vendorsList: string[]
) => {
  if (vendorsList.length === 0) {
    return filters
  }

  // Find the object that has filterName === '제조회사'
  const 제조회사 = filters.find(filter => filter.filterName === '제조회사')

  // If 제조회사 filter is not present in the filters list,
  // then create one and add it to the filters list
  if (제조회사 === undefined) {
    return [
      ...filters,
      {
        filterName: '제조회사',
        filterOptions: vendorsList
      }
    ]
  }

  제조회사.filterOptions = [
    // Append vendors list and remove duplicate values
    ...new Set([...제조회사.filterOptions, ...vendorsList])
  ]

  return filters
}
