import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_sezax9w5r',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/sezax9w5r'
});

export default imagekit;

export const uploadToImageKit = async (
  file: Buffer,
  fileName: string,
  folder: string = 'profile-pictures'
): Promise<string> => {
  try {
    const uploadResponse = await imagekit.upload({
      file: file,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      tags: ['profile', 'user'],
    });
    
    return uploadResponse.url;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error('Failed to upload image');
  }
};

export const deleteFromImageKit = async (fileId: string): Promise<void> => {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error('ImageKit delete error:', error);
    throw new Error('Failed to delete image');
  }
};

export const getImageKitAuthParams = () => {
  return imagekit.getAuthenticationParameters();
};
