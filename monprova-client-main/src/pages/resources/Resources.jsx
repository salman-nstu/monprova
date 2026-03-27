import React from 'react';
import PageCover from '../shared/PageCover';
import SectionHeader from '../shared/SectionHeader';
import BlogSection from '../home/blogs/BlogSection';
import VideoSection from '../home/videos/VideoSection';
import ActionButton from '../../components/ActionButton';
import { Outlet, useLocation } from 'react-router-dom';
import { resourcesCoverConfig } from '../../resourcesCoverConfig';

const Resources = () => {
    return (
        <div>
            <Outlet></Outlet>
        </div>
    );
};

export default Resources;