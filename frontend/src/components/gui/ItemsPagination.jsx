import Pagination from 'react-bootstrap/Pagination';
import { useEffect, useState } from "react";

export default function ItemsPagination({ records, setPageItemsCallback }) {

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationItems, setPaginationItems] = useState([]);
  const [maxPagesOverflowed, setMaxPagesOverflowed] = useState(false);

  useEffect(() => {
    const itemsPerPage = 5;
    const maxVisiblePages = 3;
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const pagesCount = Math.ceil(records.length / itemsPerPage);
    const pageItems = records.slice(firstItemIndex, lastItemIndex);

    setLastPage(pagesCount);
    setPageItemsCallback(pageItems);

    const isMaxPagesCountOverflowed = pagesCount > maxVisiblePages;
    setMaxPagesOverflowed(isMaxPagesCountOverflowed);

    let pageNumbers = [];
    if (isMaxPagesCountOverflowed) {

      if (currentPage - 2 > 0) {
        pageNumbers.push(currentPage - 2);
      }

      if (currentPage - 1 >= 1) {
        pageNumbers.push(currentPage - 1);
      }

      pageNumbers.push(currentPage);

      if (currentPage + 1 <= pagesCount && pageNumbers.length <= 3) {
        pageNumbers.push(currentPage + 1);
      }

      if (currentPage + 2 < pagesCount && pageNumbers.length < 3) {
        pageNumbers.push(currentPage + 2);
      }

      if (pageNumbers.length > 3) {
        pageNumbers.shift();
      }
    } else {
      for (let pageNumber = 1; pageNumber <= pagesCount; pageNumber++) {
        if (!pageNumbers.includes(pageNumber)) {
          pageNumbers.push(pageNumber);
        }
      }
    }
    if (!pagesCount) {
      pageNumbers.push(1);
    }

    setPaginationItems(pageNumbers);
    // eslint-disable-next-line
  }, [records.length, currentPage]);

  return (
    <Pagination className="justify-content-center mt-6">
      <Pagination.First 
        disabled={currentPage === 1} 
        onClick={() => setCurrentPage(1)} />

      <Pagination.Prev 
        disabled={currentPage - 1 < 1} 
        onClick={() => setCurrentPage(currentPage - 1)} />

      {maxPagesOverflowed && currentPage > 2 && (
        <Pagination.Ellipsis className="muted" />
      )}

      {paginationItems.map(pageNum => (
        <Pagination.Item 
          key={pageNum} 
          onClick={() => setCurrentPage(pageNum)} 
          active={pageNum === currentPage}>
          {pageNum}
        </Pagination.Item>
      ))}

      {(maxPagesOverflowed && 
        currentPage < lastPage && 
        (currentPage + 1 < lastPage || 
        currentPage + 2 < lastPage)) && (
        <Pagination.Ellipsis className="muted" />
      )}

      <Pagination.Next 
        disabled={currentPage + 1 > lastPage} 
        onClick={() => setCurrentPage(currentPage + 1)} />

      <Pagination.Last 
        disabled={currentPage === lastPage} 
        onClick={() => setCurrentPage(lastPage)} />
    </Pagination>
  );
};
