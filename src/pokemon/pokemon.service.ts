import { BadRequestException, HttpCode, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  
   async create(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
   createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

   try {     
     const createdPokemon = await this.pokemonModel.create(createPokemonDto);
     return createdPokemon;
   } catch (error) {
    this.handleException(error)
   }
  }

  async findAll(): Promise<Pokemon []> {

    return this.pokemonModel.find().exec();

  }

  async findOne(term: string) {

    let pokemon: Pokemon;

    if (!isNaN(+term)) {
        pokemon = await this.pokemonModel.findOne({no: term})
    }

    if (!pokemon && isValidObjectId(term)) {
        pokemon = await this.pokemonModel.findById(term);
    }
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({name: term.toLocaleLowerCase().trim()})
    }

    if (!pokemon) 
       throw new NotFoundException(`Pokemon with id, name or "${term}" not found`)


    return pokemon;
  }

 async  update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term);

    if (!pokemon) {
        return new NotFoundException(`Pokemon "${term}" not found`)
    }

    

    if (pokemon.name) {
      pokemon.name = pokemon.name.toLowerCase();
    }
    
    
      try {
        await pokemon.updateOne(updatePokemonDto, {new: true})
        return {...pokemon.toJSON(), ...updatePokemonDto};
      } catch (error) {
        this.handleException(error);
      }

  }

  async remove(id: string) {

  
      const {deletedCount} =  await this.pokemonModel.deleteOne({_id: id});
      if (deletedCount === 0 ) 
          throw new BadRequestException(`Pokemon with id "${id} not found"`)
      return;
    }

  private handleException (error: any){

    if (error.code === 11000) {
          throw new BadRequestException(`Pokemon already exist in DB ${JSON.stringify(error.keyValue)}`);
          }
          console.log(error)
          throw new InternalServerErrorException(`Can't process Pokemon -  Check logs`)
    
  }
}
