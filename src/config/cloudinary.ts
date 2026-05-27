export function uploadOptions(folder: string = "samples", publicId: string | null = null) {
    return {
        sources: ['local', 'url', 'camera'], 
        multiple: false,   
        folder: folder,  
        ...(publicId && {publicId: publicId}),                              
        maxFiles: 1,                                     
        resourceType: 'image',                             
        clientAllowedFormats: ['png', 'jpeg', 'webp', 'jpg'],
        maxFileSize: 1024 * 5120,  // limit 5 MB       
        cropping: true,                      
        styles: {
            palette: {
                window: '#FFFFFF',
                sourceBg: '#F4F4F5',
                windowBorder: '#90A0B3',
                tabIcon: '#0078FF',
                inactiveTabIcon: '#6E7E91',
                textMain: '#282828',
                textLink: '#0078FF',
                action: '#3399FF',
                inProgress: '#00BFFF',
                complete: '#20B2AA',
                error: '#EA2727',
                background: '#E6E6FA'
            }
        }
    }
}

