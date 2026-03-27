

const SectionHeader = ({heading, subHeading}) => {
    return (
        <div className="my-0 py-0">
            <h2 className="text-center font-bold text-4xl leading-normal text-blue-500">--- {heading} ---</h2>
            <p className="font-semibold text-center  border-y-2 w-1/2 mx-auto py-4 text-red-400">{subHeading}</p>
        </div>
    );
};

export default SectionHeader;