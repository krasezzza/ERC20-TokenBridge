import Pagination from 'react-bootstrap/Pagination';
import { useEffect, useState } from "react";

export default function ItemsPagination({ records, setPageItemsCallback }) {

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationItems, setPaginationItems] = useState([]);

  useEffect(() => {
    const itemsPerPage = 5;
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const pagesCount = Math.ceil(records.length / itemsPerPage);
    const pageItems = records.slice(firstItemIndex, lastItemIndex);

    setPageItemsCallback(pageItems);

    let pageNumbers = [1];
    for (let pageNumber = 1; pageNumber <= pagesCount; pageNumber++) {
      if (!pageNumbers.includes(pageNumber)) {
        pageNumbers.push(pageNumber);
      }
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

      {paginationItems.map(pageNum => (
        <Pagination.Item 
          key={pageNum} 
          onClick={() => setCurrentPage(pageNum)} 
          active={pageNum === currentPage}>
          {pageNum}
        </Pagination.Item>
      ))}

      <Pagination.Next 
        disabled={currentPage + 1 > paginationItems.length} 
        onClick={() => setCurrentPage(currentPage + 1)} />

      <Pagination.Last 
        disabled={currentPage === paginationItems.length} 
        onClick={() => setCurrentPage(paginationItems.length)} />
    </Pagination>
  );
};
