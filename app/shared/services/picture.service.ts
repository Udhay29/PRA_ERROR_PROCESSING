import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Injectable} from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class ProfilePictureService {

    readonly URLS: any = environment.urls.employeeService;

    constructor(private http: HttpClient) {
    }

    getProfilePicture( user: string): Observable<string> {
        const defaultPicture = 'assets/images/nouser.png';
        if (!user) {
            return of(defaultPicture);
        }
        let path: string = this.URLS.securityLdapUsers;
        path += user;
        path += '/AD_USERID,THUMBNAIL_PHOTO';
        return this.http.get(path).pipe(
            map((body: any[]) => body.filter(profPic => !!profPic.thumbPhoto)),
            map( picList => {
                let profilePicture: string;
                picList.forEach(pic => {
                    if (pic.userId.toUpperCase() === user.toUpperCase()) {
                        profilePicture = pic.thumbPhoto;
                    }
                });
                let picture: string;
                picture = `data:image/png;base64,${profilePicture}`;
                    return picture ? picture : defaultPicture;
            })
        );
    }
}