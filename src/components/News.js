import React, { useEffect, useState, useCallback } from 'react';
import NewsItem from './NewsItem';
import Spinner from './Spinner';
import PropTypes from 'prop-types';
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingBar from 'react-top-loading-bar';

const News = ({ 
    apiKey = process.env.REACT_APP_NEWS_API, // Use the API key from environment variables
    pageSize = 10, // Default pageSize to 10
    setProgress, 
    category = 'general', // Default category to general
    country = 'us' // Default country to US
}) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [progress, setProgressState] = useState(0); // State for loading bar progress

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const fetchNewsArticles = useCallback(async (currentPage) => {
        setProgressState(10); // Start loading bar
        const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}&pageSize=${pageSize}&page=${currentPage}`;
        setLoading(true);
        try {
            let response = await fetch(url);
            setProgressState(30); // Update loading bar
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let parsedData = await response.json();
            setProgressState(70); // Update loading bar

            const fetchedArticles = parsedData.articles || [];
            setArticles((prevArticles) => [...prevArticles, ...fetchedArticles]);
            setTotalResults(parsedData.totalResults || 0);
        } catch (error) {
            console.error("Error fetching news articles:", error);
            alert("Failed to load articles. Please check your API key and category.");
            setArticles([]);
            setTotalResults(0);
        }
        setLoading(false);
        setProgressState(100); // Complete loading bar
    }, [apiKey, category, country, pageSize]);

    useEffect(() => {
        document.title = `${capitalizeFirstLetter(category)} - NewsMonkey`;
        fetchNewsArticles(page);
    }, [fetchNewsArticles, page, category]); // Include category in the dependency array

    const fetchMoreData = () => {
        const nextPage = page + 1;
        setPage(nextPage);
    };

    return (
        <>
            <LoadingBar
                color="#f11946"
                progress={progress}
                onLoaderFinished={() => setProgressState(0)} // Reset the loading bar
            />
            <h1 className="text-center" style={{ margin: '35px 0px', marginTop: '90px' }}>
                NewsMonkey - Top {capitalizeFirstLetter(category)} Headlines
            </h1>
            {loading && <Spinner />}
            {(!loading && articles.length === 0) && (
                <div className="text-center">
                    <p>Failed to load articles. Please try again later.</p>
                </div>
            )}
            <InfiniteScroll
                dataLength={articles.length}
                next={fetchMoreData}
                hasMore={articles.length < totalResults}
                loader={<h4>Loading...</h4>}
            >
                <div className="container">
                    <div className="row">
                        {articles.map((element) => (
                            <div className="col-md-4" key={element.url}>
                                <NewsItem 
                                    title={element.title || ""} 
                                    description={element.description || ""} 
                                    imageUrl={element.urlToImage} 
                                    newsUrl={element.url} 
                                    author={element.author || "Unknown"} 
                                    date={element.publishedAt} 
                                    source={element.source ? element.source.name : "Unknown"} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </InfiniteScroll>
        </>
    );
};

News.propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number,
    category: PropTypes.string.isRequired,
    apiKey: PropTypes.string.isRequired,
    setProgress: PropTypes.func.isRequired,
};

export default News;
