export const LogoIcon = () => (
    <svg className="w-12 h-12 text-[#FF6B00]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 5.17L16.24 12 12 18.83 7.76 12 12 5.17M12 2L2 12l10 10 10-10L12 2z"/>
    </svg>
);

export const PhoneIcon = ({ className }: { className?: string }) => (
    <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
);