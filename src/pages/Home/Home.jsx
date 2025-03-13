import { NavLink, Routes, Route, useLocation } from 'react-router-dom';
import HomeIcon from '../../assets/icons/home.svg';
import MessengerIcon from '../../assets/icons/messenger.svg';
import FriendsIcon from '../../assets/icons/friends.svg';
import NewsPage from '../NewsPage/NewsPage';
import ChatListPage from '../ChatListPage/ChatListPage';
import FriendsListPage from '../FriendsListPage/FriendsListPage';
import UserProfilePage from '../UserProfilePage/UserProfilePage';
import './Home.css';

const NAVIGATION_ITEMS = [
    {
        id: 'main',
        title: 'Главная',
        icon: HomeIcon,
        path: '/',
        component: NewsPage
    },
    {
        id: 'messenger',
        title: 'Мессенджер',
        icon: MessengerIcon,
        path: '/messenger',
        component: ChatListPage
    },
    {
        id: 'friends',
        title: 'Друзья',
        icon: FriendsIcon,
        path: '/friends',
        component: FriendsListPage
    }
];

function Home() {
    const location = useLocation();

    return (
        <main className="home-container">
            <div className="navigation-container">
                {NAVIGATION_ITEMS.map(item => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <img
                            src={item.icon}
                            alt={item.title}
                            className="nav-icon"
                        />
                        <span className="nav-text">{item.title}</span>
                    </NavLink>
                ))}
            </div>
            <div className="content-container">
                <Routes>
                    <Route path="/" element={<NewsPage />} />
                    <Route path="/messenger" element={<ChatListPage />} />
                    <Route path="/messenger/:chatId" element={<ChatListPage />} />
                    <Route path="/friends" element={<FriendsListPage />} />
                    <Route path="/profile" element={<UserProfilePage />} />
                </Routes>
            </div>
        </main>
    );
}

export default Home;
