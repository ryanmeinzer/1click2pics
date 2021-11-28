import React, {useState, useEffect} from 'react'
import {Button, Image, View, Platform} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library';

export default function ImagePickerExample() {

  // ToDo - remove states, just use MediaLibrary to only ever have two images in array/library and use the first as the first image and the second as the second, conditionally checking if they exist instead of state to prompt the user to select (or replace) the respective image

  const [image2, setImage2] = useState(null)

  const [albumExists, setAlbumExists] = useState(false)
  const [asset1Exists, setAsset1Exists] = useState(false)
  const [asset2Exists, setAsset2Exists] = useState(false)
  const [asset1, setAsset1] = useState(null)
  const [asset2, setAsset2] = useState(null)
  const [albumId, setAlbumId] = useState(null)

  useEffect(() => {
    console.log(
      'albumExists:', albumExists, '\n',
      'asset1Exists:', asset1Exists, '\n',
      'asset2Exists:', asset2Exists, '\n',
      'asset1:', asset1, '\n',
      'asset2:', asset2,
    )
  })

  useEffect(() => {
    // check to see if the album exists
    MediaLibrary.getAlbumAsync('1click2pics')
      .then(result => result != null && setAlbumExists(true))
    
    albumExists &&
    // if albumExists, check to see which assets exist (if only one asset, it will be forced to be the first)
    MediaLibrary.getAlbumAsync('1click2pics')
      .then(result => {
        console.log('result.assetCount:', result.assetCount)
        result.assetCount === 2 && (setAsset1Exists(true), setAsset2Exists(true))
        result.assetCount === 1 && setAsset1Exists(true)
      })
  })

  useEffect(() => {
    // if albumExists, get album id, setAlbumID and set existing assets (if only one asset, it will be forced to be the first)
    albumExists &&
    MediaLibrary.getAlbumAsync('1click2pics')
      .then(album => {
        const albumId = album.id
        setAlbumId(album.id)
        MediaLibrary.getAssetsAsync({album: albumId})
          .then(info => {
            console.log('info.assets.length:', info.assets.length)
            console.log('info.assets.length === 1 boolean:', info.assets.length === 1)
            console.log('info.assets.length === 2 boolean:', info.assets.length === 2)
            info.assets.length === 2 && (setAsset1(info.assets[1]), setAsset2(info.assets[0]))
            info.assets.length === 1 && setAsset1(info.assets[0])
          })
      })
  }, [albumExists])


  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!')
        }
      }
    })()
  }, [])

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.cancelled) {

      !albumExists ?
        // create asset
        await MediaLibrary.createAssetAsync(result.uri)
          .then(asset => {
            // create album and add asset to it
            MediaLibrary.createAlbumAsync('1click2pics', asset.id)
              .then(setAsset1(asset))
            // .then(setImage({localUri: asset.uri}, console.log('asset1:', asset1)))
          })
        :
        // create asset
        await MediaLibrary.createAssetAsync(result.uri)
          .then(asset => {
            // delete current asset1
            MediaLibrary.deleteAssetsAsync(asset1.id)
            // add asset to album
            MediaLibrary.addAssetsToAlbumAsync(asset, `${albumId}`)
              .then(setAsset1(asset))
          })
    }
  }

  const pickImage2 = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.cancelled) {

      // create album if it doesn't exist 
      !albumExists && MediaLibrary.createAlbumAsync('1click2pics')

      // get album id
      const albumId = await MediaLibrary.getAlbumAsync('1click2pics')
        .then(album => album.id)

      // create app asset from local file
      const asset2 = await MediaLibrary.createAssetAsync(result.uri)

      // add asset to album
      MediaLibrary.addAssetsToAlbumAsync(asset2, `${albumId}`)

      setImage2({localUri: asset2.uri})
    }
  }

  // get last asset (AppExpo places it first in the array, not the last)
  // MediaLibrary.getAssetsAsync()
  //   .then(info => {console.log('last asset:', info.assets[0].uri)})
  
  // get all assets
  // MediaLibrary.getAssetsAsync()
  //   .then(info => {console.log('all assets count:', info.assets.length)})

  return (
    <>
      <View style={{flex: 1, marginTop: 50, marginHorizontal: 10, alignItems: 'center', justifyContent: 'center'}}>
        <Button title={asset1 ? "Change pic #1 (example: ID)" : "Choose pic #1 (example: ID)"} onPress={pickImage} />
        {/* // either of the below local or album uri works and holds the image in memory */}
        {/* {<Image source={{uri: `file:///Users/ryanmeinzer/Library/Developer/CoreSimulator/Devices/10D62BD0-9D7D-4ADD-9D0D-266E0788EF82/data/Media/DCIM/100APPLE/IMG_0094.JPG`}} style={{width: '100%', height: '75%'}} />} */}
        {asset1 && <Image source={{uri: asset1.uri}} style={{width: '100%', height: '75%'}} />}
        {/* {image && <Image source={{uri: image.localUri}} style={{width: '100%', height: '75%'}} />} */}
      </View>
      <View style={{flex: 1, marginBottom: 25, marginHorizontal: 10, alignItems: 'center', justifyContent: 'center'}}>
        <Button title={image2 ? "Change pic #2 (example: Vaccine Card)" : "Choose pic #2 (example: Vaccine Card)"} onPress={pickImage2} />
        {image2 && <Image source={{uri: image2.localUri}} style={{width: '100%', height: '75%'}} />}
      </View>
    </>
  )
}
