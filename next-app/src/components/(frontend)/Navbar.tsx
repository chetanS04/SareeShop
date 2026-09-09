'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  RiCloseLine,
  RiHeartLine,
  RiLogoutBoxRLine,
  RiMenuLine,
  RiSearchLine,
  RiShoppingBagLine,
  RiUserLine,
} from 'react-icons/ri';
import { TbLayoutDashboardFilled } from 'react-icons/tb';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLike } from '@/context/LikeContext';
import NotificationBell from '@/components/(sheared)/NotificationBell';
import { getActiveAnnouncements } from '../../../utils/topbarAnnouncementApi';
import { TopbarAnnouncement } from '@/common/interface';
import axios from '../../../utils/axios';
import { getCategorySlug, getProductSlug } from '../../../utils/slugUtils';

const LOGO_MARK = '/svastra/logo-mark.png';

type NavLink = {
  href: string;
  label: string;
  /** route prefix this link owns, e.g. '/products' */
  route?: string;
  /** home section id this link owns, e.g. 'shop-who' */
  section?: string;
};

const NAV_LINKS: NavLink[] = [
  { href: '/new-arrivals', label: 'New In', route: '/new-arrivals' },
  { href: '/#shop-who', label: 'Shop Who You Are', section: 'shop-who' },
  { href: '/#shop-feel', label: 'Shop How You Feel', section: 'shop-feel' },
  { href: '/products', label: 'Collections', route: '/products' },
  { href: '/about-us#voices', label: 'Stories', route: '/about-us', section: 'voices' },
  { href: '/about-us', label: 'About', route: '/about-us' },
];

/** Home sections tracked by the scroll-spy, in document order. */
const HOME_SECTIONS = ['shop-who', 'shop-feel', 'independent-cut', 'manifesto', 'voices'];

const basePath = process.env.NEXT_PUBLIC_UPLOAD_BASE || 'https://api.zelton.co.in';

export default function Navbar() {
  const { user, logout, openAuthModal } = useAuth();
  const { count } = useCart();
  const { likedProducts } = useLike();
  const router = useRouter();
  const pathname = usePathname();

  const [avatarError, setAvatarError] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<TopbarAnnouncement[]>([]);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAvatarError(false);
  }, [user]);

  useEffect(() => {
    getActiveAnnouncements().then((data) => {
      if (Array.isArray(data)) setAnnouncements(data);
    });
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  useEffect(() => {
    axios
      .get('/api/categories?order_by=products_count')
      .then((response) => {
        const rawData = response.data;
        const list = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.data?.categories)
            ? rawData.data.categories
            : Array.isArray(rawData?.categories)
              ? rawData.categories
              : [];
        setCategories(list);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Scroll-spy + hash: highlight the home / about section in view.
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveSection(hash);
    };

    applyHash();
    window.addEventListener('hashchange', applyHash);

    if (pathname !== '/' && pathname !== '/about-us') {
      return () => window.removeEventListener('hashchange', applyHash);
    }

    const ids = pathname === '/' ? HOME_SECTIONS : ['voices', 'manifesto'];
    const elements = ids.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (elements.length === 0) {
      return () => window.removeEventListener('hashchange', applyHash);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-28% 0px -55% 0px', threshold: [0.05, 0.25, 0.5] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', applyHash);
    };
  }, [pathname]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await axios.get(
        `/api/search-products?q=${encodeURIComponent(query)}&limit=8`
      );
      if (response.data.res === 'success' || response.data.success) {
        const payloadData = response.data.data;
        setSearchResults(Array.isArray(payloadData) ? payloadData : payloadData?.products || []);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => performSearch(value), 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    router.refresh();
  };

  const announcementText =
    announcements.length > 0
      ? announcements[announcementIndex]?.message || announcements[announcementIndex]?.text
      : 'Complimentary Concierge & Global Shipping on Curated Edits · Wear Yourself';

  const isActive = (link: NavLink) => {
    if (link.label === 'About') {
      return pathname === '/about-us' && activeSection !== 'voices';
    }
    if (link.label === 'Stories') {
      return pathname === '/about-us' && activeSection === 'voices';
    }
    if (link.section) {
      return (pathname === '/' || pathname === '/about-us') && activeSection === link.section;
    }
    if (!link.route) return false;
    if (link.route === '/products') {
      return pathname === '/products' || pathname.startsWith('/products/');
    }
    return pathname === link.route || pathname.startsWith(`${link.route}/`);
  };

  const iconActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const avatarSrc = user?.profile_picture
    ? user.profile_picture.startsWith('http')
      ? user.profile_picture
      : `${basePath}${user.profile_picture.startsWith('/') ? '' : '/'}${user.profile_picture}`
    : null;

  const wishlistCount = Array.isArray(likedProducts) ? likedProducts.length : 0;

  return (
    <>
      <aside
        className="w-full bg-surface-dark text-surface label-caps py-2.5 site-pad text-center select-none z-50"
        aria-label="Site announcement"
      >
        <span className="block truncate sm:whitespace-normal opacity-90">
          {announcementText || 'Complimentary Concierge & Global Shipping · Wear Yourself'}
        </span>
      </aside>

      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border-line">
        <div className="max-w-site mx-auto site-pad h-20 flex items-center justify-between gap-4">
          <Link href="/" aria-label="SVastra Home" className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <img src={LOGO_MARK} alt="" className="h-8 w-8 object-contain shrink-0" width={32} height={32} />
            <span className="text-[22px] sm:text-[26px] md:text-[28px] font-semibold tracking-tight uppercase text-on-surface leading-none">
              SVASTRA
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 xl:gap-8" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const active = isActive(link);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`nav-link ${active ? 'is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => {
                    if (link.section) setActiveSection(link.section);
                    if (link.label === 'About') setActiveSection(null);
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              type="button"
              aria-label="Search Collections"
              className="touch-target text-on-surface hover:text-primary transition-colors"
              onClick={() => setSearchOpen(true)}
            >
              <RiSearchLine className="text-[20px]" />
            </button>

            {user ? <NotificationBell /> : null}

            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                type="button"
                aria-label="Customer Profile"
                className={`touch-target transition-colors ${iconActive('/profile') || iconActive('/orders') ? 'text-primary' : 'text-on-surface hover:text-primary'}`}
                onClick={() => {
                  if (!user) openAuthModal('login');
                  else setAccountOpen((v) => !v);
                }}
              >
                <RiUserLine className="text-[20px]" />
              </button>
              {accountOpen && user && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-on-surface z-50">
                  <div className="px-4 py-3 border-b border-border-line">
                    <p className="text-xs font-semibold uppercase tracking-wider truncate">{user.name || 'Client'}</p>
                    <p className="text-[11px] text-body-slate truncate">{user.email}</p>
                  </div>
                  <Link href="/profile" className="block px-4 py-3 text-[11px] font-semibold uppercase tracking-wider hover:bg-surface-subtle" onClick={() => setAccountOpen(false)}>
                    Profile
                  </Link>
                  <Link href="/orders" className="block px-4 py-3 text-[11px] font-semibold uppercase tracking-wider hover:bg-surface-subtle" onClick={() => setAccountOpen(false)}>
                    Orders
                  </Link>
                  {user.role === 'Admin' && (
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider hover:bg-surface-subtle" onClick={() => setAccountOpen(false)}>
                      <TbLayoutDashboardFilled /> Dashboard
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-primary hover:bg-surface-subtle border-t border-border-line">
                    <RiLogoutBoxRLine /> Logout
                  </button>
                </div>
              )}
            </div>

            <Link
              aria-label="Saved Items"
              href="/wishlist"
              className={`touch-target relative transition-colors ${iconActive('/wishlist') ? 'text-primary' : 'text-on-surface hover:text-primary'}`}
            >
              <RiHeartLine className="text-[20px]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-0.5 bg-primary text-surface text-[10px] font-semibold flex items-center justify-center leading-none">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              aria-label={`Shopping Bag, ${count} items`}
              href="/cart"
              className={`touch-target relative transition-colors ${iconActive('/cart') || iconActive('/checkout') ? 'text-primary' : 'text-on-surface hover:text-primary'}`}
            >
              <RiShoppingBagLine className="text-[20px]" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-surface text-[10px] font-semibold flex items-center justify-center leading-none">
                {count > 9 ? '9+' : count}
              </span>
            </Link>

            {avatarSrc && !avatarError ? (
              <div className="pl-1 sm:pl-2 ml-0.5 hidden sm:flex items-center">
                <img
                  alt="Profile"
                  src={avatarSrc}
                  className="sv-round w-8 h-8 object-cover"
                  width={32}
                  height={32}
                  onError={() => setAvatarError(true)}
                />
              </div>
            ) : null}

            <button
              type="button"
              className="touch-target lg:hidden text-on-surface hover:text-primary transition-colors"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <RiMenuLine className="text-[22px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60]" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button type="button" className="absolute inset-0 bg-surface-dark/45" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[min(22rem,88vw)] bg-surface border-l border-border-line p-5 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <img src={LOGO_MARK} alt="" className="h-7 w-7 object-contain" width={28} height={28} />
                <span className="font-semibold uppercase tracking-tight text-lg">SVASTRA</span>
              </div>
              <button type="button" className="touch-target" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                <RiCloseLine className="text-[24px]" />
              </button>
            </div>

            <nav className="flex flex-col" aria-label="Mobile primary">
              {[
                ...NAV_LINKS,
                { href: '/categories', label: 'Categories', route: '/categories' },
                { href: '/brands', label: 'Brands', route: '/brands' },
                { href: '/contact-us', label: 'Concierge', route: '/contact-us' },
              ].map((link) => {
                const active = isActive(link);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`py-3.5 border-b border-border-line text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${
                      active
                        ? 'text-on-surface border-l-2 border-l-primary pl-3 -ml-0.5'
                        : 'text-body-slate hover:text-on-surface'
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {categories.length > 0 && (
              <div className="mt-6">
                <p className="label-caps text-primary mb-3">Shop by Category</p>
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                  {categories.slice(0, 12).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/subcategories/${getCategorySlug(cat)}`}
                      className="py-2 text-[12px] uppercase tracking-wider text-body-slate hover:text-primary"
                      onClick={() => setMobileOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-10 space-y-3">
              {user ? (
                <>
                  <Link href="/profile" className="block w-full border border-on-surface text-center py-3.5 text-[11px] font-semibold tracking-[0.08em] uppercase" onClick={() => setMobileOpen(false)}>
                    My Account
                  </Link>
                  <button type="button" className="block w-full bg-primary text-surface text-center py-3.5 text-[11px] font-semibold tracking-[0.08em] uppercase" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="block w-full bg-primary text-surface text-center py-3.5 text-[11px] font-semibold tracking-[0.08em] uppercase"
                  onClick={() => {
                    setMobileOpen(false);
                    openAuthModal('login');
                  }}
                >
                  Sign In
                </button>
              )}
              <p className="text-[11px] text-body-slate tracking-wide">Wear Yourself ™</p>
            </div>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[70] bg-surface-dark/50 flex items-start justify-center pt-24 px-4">
          <div className="w-full max-w-2xl bg-surface border border-border-line p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="label-caps text-primary">Search Collections</span>
              <button type="button" aria-label="Close search" className="touch-target" onClick={() => setSearchOpen(false)}>
                <RiCloseLine className="text-[22px]" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search products, textiles, edits…"
                className="flex-1 bg-surface border border-on-surface px-4 py-3 text-sm text-on-surface placeholder:text-body-slate/60 focus:outline-none uppercase tracking-wide"
              />
              <button type="submit" className="sv-btn-primary px-5">
                Search
              </button>
            </form>
            <div className="mt-4 max-h-72 overflow-y-auto">
              {isSearching && <p className="text-sm text-body-slate py-3">Searching…</p>}
              {!isSearching && searchResults.map((product) => {
                const slug = getProductSlug(product);
                return (
                  <button
                    key={product.id}
                    type="button"
                    className="w-full text-left py-3 border-b border-border-line hover:bg-surface-subtle px-1"
                    onClick={() => {
                      if (!slug) return;
                      router.push(`/products/${slug}`);
                      setSearchOpen(false);
                    }}
                  >
                    <span className="text-sm font-semibold uppercase tracking-tight block">{product.name}</span>
                    {product.brand?.name && (
                      <span className="text-[11px] text-body-slate uppercase tracking-wider">{product.brand.name}</span>
                    )}
                  </button>
                );
              })}
              {!isSearching && searchQuery && searchResults.length === 0 && (
                <p className="text-sm text-body-slate py-3">No archive matches found.</p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/categories" className="text-[11px] font-semibold uppercase tracking-wider text-primary" onClick={() => setSearchOpen(false)}>
                Browse Categories →
              </Link>
              <Link href="/products" className="text-[11px] font-semibold uppercase tracking-wider text-primary" onClick={() => setSearchOpen(false)}>
                All Products →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
