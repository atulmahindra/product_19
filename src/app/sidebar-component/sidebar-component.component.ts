import { OnInit, ChangeDetectorRef, Component, ElementRef, HostListener, signal } from '@angular/core';
import { SharedService } from '../shared/shared.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

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

  constructor(private elRef: ElementRef, private _shared_service: SharedService, private _authService :AuthService,private router:Router, private cookieService: CookieService) { }

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
         this.cookieService.delete('access_token', '/', '.mlldev.com');
     
       this._authService.user.next(null);
    this.router.navigate(['']);
    localStorage.removeItem("loggedin user data");
      this._shared_service.logOutUser(this.cookieService.get('session_id')).subscribe({
        next: (response: any) => {
          // this.cookieService.deleteAll()
          // window.location.href = "/"
            this.cookieService.delete('access_token', '/', '.mlldev.com');
        console.log(response, "logout done");
       this._authService.user.next(null);
    this.router.navigate(['']);
    localStorage.removeItem("loggedin user data");
        },
        error: (err) => {
          this.cookieService.deleteAll()
          console.error('Error loading menu items:', err);
        }
      });
    }
  }

  onMenuClickPrimary(item: any) {
    console.log("item",item);
    if(item?.project_name == "Old Project"){
      this.isCollapsed = true
     
    }
    this.isCollapsed = true
    this.router.navigate([item.link]);
  }
  loadItems(id: string) {
    if (this.loading) return; // Prevent concurrent loads
    this.loading = true;
    
    const userData = JSON.parse(localStorage.getItem('loggedin user data') || '{}');
    this._shared_service.getMenus(userData?.email ?? "", id).subscribe({
      next: (menus: MenuItem[]) => {
        console.log("menus", menus);
        // If id is empty, reset the list instead of appending
        const mappedMenus = menus.map(e => ({
          ...e,
          icon: '',
          link: `/backend/Dashboard/${e._id}`
        }));
        
        if (!id) {
          // Reset list when id is empty (initial load)
          this.menuItems.set(mappedMenus);
        } else {
          // Append for pagination/scroll loads
          this.menuItems.set([...this.menuItems(), ...mappedMenus]);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading menu items:', err);
        this.loading = false;
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
   
    this.menuItems.set([]);
    this.loadItems('');
    this.isCollapsed = !this.isCollapsed;
    this.openDropdown = null;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth <= 1024) this.isCollapsed = true;
  }
}