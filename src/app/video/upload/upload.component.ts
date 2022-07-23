import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnInit {
  isDragover = false;
  file: File | null = null;
  nextStep = false;
  inSubmission = false;

  constructor(private storage: AngularFireStorage) {}

  // title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  ngOnInit(): void {}

  showAlert = false;
  alertMsg = 'Please wait! Your file is being uploaded.';
  alertColor = 'blue';

  uploadForm = new FormGroup({
    title: this.title,
  });

  storeFile($event: Event) {
    this.isDragover = false;
    this.file = ($event as DragEvent).dataTransfer?.files.item(0) ?? null;
    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    //console.log(this.file);
    //console.log(this.$event);
    this.nextStep = true;
  }

  async uploadFile() {
    //console.log('File uploaded');
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your file is being uploaded.';
    this.alertColor = 'blue';
    this.inSubmission = true;
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;
    try {
      await this.storage.upload(clipPath, this.file);
    } catch (e) {
      console.error(e);
      this.alertMsg = 'An unexpected error occured. Please try again later';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }
    this.alertMsg = 'Success! Your file has been uploaded.';
    this.alertColor = 'green';
  }
}
