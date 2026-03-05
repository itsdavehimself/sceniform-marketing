using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DiffDetector.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGuidToMakeConnections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "Uid",
                table: "MakeConnections",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Uid",
                table: "MakeConnections");
        }
    }
}
