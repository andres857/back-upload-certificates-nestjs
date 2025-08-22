import { Injectable } from '@nestjs/common';

@Injectable()
export class VideosService {
    readonly videos_mock = {
        block: 'videos_block',
        title: 'Videos',
        videos: [
            {
                url: 'https://mediaweb.sfo3.cdn.digitaloceanspaces.com/kalm/kalm.mp4',
                title: 'hsj',
                duration: '2:30',
            },
            {
                url: 'https://mediaweb.sfo3.cdn.digitaloceanspaces.com/kalm/kalm.mp4',
                title: 'kalm',
                duration: '2:30',
            },
            {
                url: 'https://mediaweb.sfo3.cdn.digitaloceanspaces.com/lacardio/fci_programa_revascularizacion_miocardica_quirurgica_v4%201.mp4',
                title: 'lacardio',
                duration: '2:30',
            }
        ]
    };
    getVideos() {
        return this.videos_mock;    
    }
}
