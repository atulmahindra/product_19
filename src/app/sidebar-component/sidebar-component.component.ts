import { OnInit, ChangeDetectorRef, Component, ElementRef, HostListener, signal } from '@angular/core';
import { SharedService } from '../shared/shared.service';
import { CookieService } from 'ngx-cookie-service';

interface MenuItem {
  project_name: string,
  _id: string,
  icon: string,
  link: string
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar-component.component.html',
  styleUrl: './sidebar-component.component.scss'
})
export class SidebarComponent implements OnInit {
  isCollapsed = true;
  loading = false
  openDropdown: string | null = null;
  isOpen = signal(false);
  dropdownHeights: { [key: string]: number } = {};
  menuItems = signal<MenuItem[]>([])
  primaryMenu: any[] = [
    { project_name: 'New Project', icon: 'New Project.svg', link: '/backend', _id: '' },
    { project_name: 'Old Project', icon: 'Old Project.svg', link: '/backend', _id: '' }
  ];
  secondaryMenu: any[] = [
    // { label: 'Support', icon: 'help', link: '/support' },
    { label: 'Sign Out', icon: 'logout', link: '/logout' }
  ];

  constructor(private elRef: ElementRef, private _shared_service: SharedService, private cookieService: CookieService) { }

  ngOnInit(): void {
    this.loadItems("");
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
  toggleDropdown() {
    this.isOpen.update(v => !v);
  }
  onMenuClick(item: any) {
    if (item?.label == "Sign Out") {
      this._shared_service.logOutUser(this.cookieService.get('session_id')).subscribe({
        next: (response: any) => {
          this.cookieService.deleteAll()
          window.location.href = "/"
        },
        error: (err) => {
          this.cookieService.deleteAll()
          console.error('Error loading menu items:', err);
        }
      });
    }
  }

  loadItems(id: string) {
    const userData = JSON.parse(localStorage.getItem('loggedin user data') || '{}');
    this._shared_service.getMenus(userData?.email ?? "", id).subscribe({
      next: (menus: MenuItem[]) => {
        this.menuItems.set([...this.menuItems(), ...menus.map(e => ({
          ...e,
          icon: '',
          link: `/backend/${e._id}`
        }))])
      },
      error: (err) => {
        console.error('Error loading menu items:', err);
      }
    });
  }

  onScroll(event: any) {
    const element = event.target;
    const nearBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;

    if (nearBottom && !this.loading) {
      this.loadItems(this.menuItems()?.length > 0 ? this.menuItems().at(-1)["_id"] : "");
    }
  }
  selectChat(chat: any) {
    console.log('Selected chat:', chat);
    this.isOpen.set(false);
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