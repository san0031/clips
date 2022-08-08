import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  isDragover = false;
  file: File | null = null;
  nextStep = false;
  inSubmission = false;
  percentage = 0;
  showPercentage = false;
  user: firebase.User | null = null;
  task?: AngularFireUploadTask;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router
  ) {
    auth.user.subscribe((user) => (this.user = user));
  }

  // title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  ngOnDestroy(): void {
    this.task?.cancel();
  }

  showAlert = false;
  alertMsg = 'Please wait! Your file is being uploaded.';
  alertColor = 'blue';

  uploadForm = new FormGroup({
    title: this.title,
  });

  storeFile($event: Event) {
    //console.log($event);
    this.isDragover = false;
    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;
    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    //console.log(this.file);
    //console.log(this.$event);
    this.nextStep = true;
  }

  uploadFile() {
    //console.log('File uploaded');
    this.uploadForm.disable();
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your file is being uploaded.';
    this.alertColor = 'blue';
    this.inSubmission = true;
    this.showPercentage = true;
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;
    //  try {
    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);
    this.task.percentageChanges().subscribe((progress) => {
      this.percentage = (progress as number) / 100;
    });

    this.task
      .snapshotChanges()
      .pipe(
        last(),
        switchMap(() => clipRef.getDownloadURL())
      )
      .subscribe({
        next: async (url) => {
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url,
          };

          const clipDocRef = await this.clipsService.createClip(clip);
          console.log(clip);
          this.alertMsg =
            'Success!Your clip is now ready to share with the world.';
          this.alertColor = 'green';
          this.showPercentage = false;

          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id]);
          }, 1000);
        },
        error: (error) => {
          this.uploadForm.enable();
          console.error(error);
          this.alertMsg = 'Upload failed. Please try again later';
          this.alertColor = 'red';
          this.inSubmission = true;
          this.showPercentage = false;
        },
      });
    // } catch (e) {
    //   console.error(e);
    //   this.alertMsg = 'An unexpected error occured. Please try again later';
    //   this.alertColor = 'red';
    //   this.inSubmission = false;
    //   return;
    // }
    // this.alertMsg = 'Success! Your file has been uploaded.';
    // this.alertColor = 'green';
  }
}
