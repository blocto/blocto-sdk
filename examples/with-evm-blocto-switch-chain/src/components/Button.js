export default function BloctoButton({ children, onClick }) {
    return (
        <button className="btn" onClick={onClick}>
            <span>{children}</span>
        </button>
    );
}
