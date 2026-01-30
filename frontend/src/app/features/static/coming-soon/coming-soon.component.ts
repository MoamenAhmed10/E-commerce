import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './coming-soon.component.html',
  styleUrl: './coming-soon.component.css',
})
export class ComingSoonComponent {
  pageTitle = 'Coming Soon';

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data) => {
      if (data['title']) {
        this.pageTitle = data['title'];
      }
    });
  }
}
