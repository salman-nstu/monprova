import { Link } from "react-router-dom";
import Button from "../Button";

const BlogCard = ({blog}) => {
    const {title, img , author, category, content} = blog
    return (
        <div className="card bg-base-100 shadow-md border-1">
            <figure>
                <img
                    className="object-cover w-full h-64"
                    src={img || blog.thumbnail}
                    alt="Blogs" />
            </figure>
            <div className="card-body">
                <h3 className="card-title font-bold text-xl my-0">{title}</h3>
                <p className='font-semibold text-md'>Author: {author}</p>
                <div className="badge badge-error text-white bg-tertiary-color">{category}</div>
                <p className='text-md font-semibold'></p>
            </div>
            <div className="mb-4 mx-6">
                <Link to={`/blogDetails/${blog._id}`}>
                    <Button btnName={"বিস্তারিত পড়ুন"} bgColor="bg-primary-color"></Button>
                </Link>
            </div>
        </div>
    );
};

export default BlogCard;