import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  standalone: false,
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss'
})
export class SideNavComponent implements AfterViewInit {
  isCollapsed = true;
  openDropdown: string | null = null;
  dropdownHeights: { [key: string]: number } = {};

  // 🔹 Dynamic Menu Items
  menuItems: any[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      link: '/dashboard'
    },
    {
      label: 'Services',
      icon: 'calendar_today',
      children: [
        { label: 'IT Consulting', link: '/services/it' },
        { label: 'Cloud Solutions', link: '/services/cloud' },
        { label: 'Mobile Apps', link: '/services/mobile' }
      ]
    },
    {
      label: 'Bookmarks',
      icon: 'star',
      children: [
        { label: 'Saved Tutorials', link: '/bookmarks/tutorials' },
        { label: 'Favorite Blogs', link: '/bookmarks/blogs' },
        { label: 'Resource Guides', link: '/bookmarks/guides' }
      ]
    },
    {
      label: 'Settings',
      icon: 'settings',
      link: '/settings'
    }
  ];

  secondaryMenu: any[] = [
    { label: 'Support', icon: 'help', link: '/support' },
    { label: 'Sign Out', icon: 'logout', link: '/logout' }
  ];

  constructor(private elRef: ElementRef,private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    // Measure dropdown heights after render
    const menus = this.elRef.nativeElement.querySelectorAll('.dropdown-menu');
    menus.forEach((menu: HTMLElement) => {
      const parent = menu.closest('.dropdown-container');
      const key = parent?.getAttribute('data-key') || '';
      console.log(menu.scrollHeight)
      this.dropdownHeights[key] = menu.scrollHeight;
    });

    if (window.innerWidth <= 1024) this.isCollapsed = true;
    
  }

  toggleDropdown(key: string, event: Event): void {
    event.preventDefault();
    this.openDropdown = this.openDropdown === key ? null : key;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.openDropdown = null;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth <= 1024) this.isCollapsed = true;
  }
}
