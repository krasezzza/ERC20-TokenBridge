export default function Button ({
  type = 'primary',
  className = '',
  disabled = false,
  loading = false,
  loadingText,
  children,
  onClick
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${type} ${className}`}
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-3"
            role="status"
            aria-hidden="true"
          ></span>{' '}
          {loadingText ? <span>{loadingText}</span> : <span>Loading...</span>}
        </>
      ) : (
        children
      )}
    </button>
  );
};
