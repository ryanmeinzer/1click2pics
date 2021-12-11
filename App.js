import React, {useState, useEffect} from 'react'
import {Button, Image, View, Platform} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library';

export default function ImagePickerExample() {

  const [albumExists, setAlbumExists] = useState(false)
  const [asset1Exists, setAsset1Exists] = useState(false)
  const [asset2Exists, setAsset2Exists] = useState(false)
  const [asset1, setAsset1] = useState(null)
  const [asset2, setAsset2] = useState(null)
  const [albumId, setAlbumId] = useState(null)

  // below used for testing
  // useEffect(() => {
  //   console.log(
  //     'albumExists:', albumExists, '\n',
  //     'asset1Exists:', asset1Exists, '\n',
  //     'asset2Exists:', asset2Exists, '\n',
  //     'asset1 really exists?:', asset1 !== null, '\n',
  //     'asset2 really exists?:', asset2 !== null,
  //   )
  // })

  useEffect(() => {
    // if albumExists, check to see which assets exist (if only one asset, it will be forced to be the first)
    MediaLibrary.getAlbumAsync('1click2pics')
      .then(result => {
        result == null ? setAlbumExists(false) : setAlbumExists(true)
        result != null && result.assetCount >= 2 && (setAsset1Exists(true), setAsset2Exists(true))
        result != null && result.assetCount === 1 && setAsset1Exists(true)
        result != null && result.assetCount <= 0 && (setAsset1Exists(false), setAsset2Exists(false))
      })
      .catch(error => console.log(error))
  // run on mount
  }, [])


  useEffect(() => {
    // if albumExists, get album id, setAlbumID and set existing assets (if only one asset, it will be forced to be the first)
    albumExists &&
    MediaLibrary.getAlbumAsync('1click2pics')
      .then(album => {
        // cover edge case of promise returning null
        if (album != null) {
          const albumId = album.id
          setAlbumId(album.id)
          MediaLibrary.getAssetsAsync({album: albumId})
            .then(info => {
              info.assets.length >= 2 && (setAsset1(info.assets[1]), setAsset2(info.assets[0]))
              info.assets.length === 1 && setAsset1(info.assets[0])
            })
            .catch(error => console.log(error))
        }
      })
      .catch(error => console.log(error))
  // run if albumExists changes
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

  const pickAsset1 = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.cancelled) {

      !albumExists
        ?
        // create asset
        await MediaLibrary.createAssetAsync(result.uri)
          .then(asset => {
            // create album and add asset to it
            MediaLibrary.createAlbumAsync('1click2pics', asset.id)
              setAsset1(asset)
              setAsset1Exists(true)
              setAlbumExists(true)
            alert("Great! After adding pic #2 and if you'd ever like to change this pic #1, you'll be prompted to let 1click2pics delete the changed/unused photos from its album to prompt you to re-add pic #1 and pic #2.")
          })
          .catch(err => console.log(err))
        : 
        // delete current asset1
        await MediaLibrary.deleteAssetsAsync(asset1.id)
          .then(
            // create asset
            await MediaLibrary.createAssetAsync(result.uri)
              .then(asset => {
                // get albumId
                MediaLibrary.getAlbumAsync('1click2pics')
                  .then(album => {
                    const albumId = album.id
                    // add asset to album
                    MediaLibrary.addAssetsToAlbumAsync(asset, `${albumId}`)
                    setAsset1(asset),
                      setAsset1Exists(true)
                  })
                  .catch(err => console.log(err))
              })
              .catch(err => console.log(err)),
            // delete current asset2 if it exists and have the user start over
            asset2 !== null &&
            await MediaLibrary.deleteAssetsAsync(asset2.id)
              .then(
                setAsset2(null),
                setAsset2Exists(false),
                alert("Nice refresh! Now let's re-add pic #2 (assuming you've allowed the app to delete the changed/unused photos from its album.")
              )
              .catch(err => console.log(err))
          )
          .catch(err => console.log(err))
    }
  }

  const pickAsset2 = async () => {

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.cancelled) {

      asset2 === null
        ?
        // create asset
        await MediaLibrary.createAssetAsync(result.uri)
          .then(asset => {
            // get albumId
            MediaLibrary.getAlbumAsync('1click2pics')
              .then(album => {
                const albumId = album.id
                // add asset to album
                MediaLibrary.addAssetsToAlbumAsync(asset, `${albumId}`)
                  setAsset2(asset),
                  setAsset2Exists(true),
                  alert("Great! Now that you've added pic #2 and if you'd ever like to change pic #1, you'll be prompted to let 1click2pics delete the changed/unused photos from its album to prompt you to re-add pic #1 and pic #2.")
              })
              .catch(err => console.log(err))
          })
          .catch(err => console.log(err))
        :
        // delete current asset2
        await MediaLibrary.deleteAssetsAsync(asset2.id)
          .then(
            // create asset
            await MediaLibrary.createAssetAsync(result.uri)
              .then(asset => {
                // add asset to album
                MediaLibrary.addAssetsToAlbumAsync(asset, `${albumId}`)
                  setAsset2(asset),
                  setAsset2Exists(true)
                  alert("Nice refresh! If you'd ever like to change pic #1, you'll be prompted to let 1click2pics delete the changed/unused photos from its album to prompt you to re-add pic #1 and pic #2.")
              })
              .catch(err => console.log(err))
          )
          .catch(err => console.log(err))
    }
  }

  const pickAsset2Alert = () => {
    alert('Choose pic #1 first, please.')
  }

  return (
    <>
      <View style={{flex: 1, marginTop: 50, marginHorizontal: 10, alignItems: 'center', justifyContent: 'center'}}>
        <Button title={asset1 ? "Change pic #1" : "Choose pic #1"} onPress={pickAsset1} />
        {asset1 && <Image source={{uri: asset1.uri}} style={{width: '100%', height: '75%'}} resizeMode='contain'/>}
      </View>
      <View style={{flex: 1, marginBottom: 25, marginHorizontal: 10, alignItems: 'center', justifyContent: 'center'}}>
        <Button title={asset2 ? "Change pic #2" : "Choose pic #2"} onPress={asset1Exists ?pickAsset2 : pickAsset2Alert} />
        {asset2 && <Image source={{uri: asset2.uri}} style={{width: '100%', height: '75%'}} resizeMode='contain' />}
      </View>
    </>
  )
}
